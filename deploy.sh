#!/usr/bin/env bash

# Enhanced Remote Deployment Script with Config File Support
# Usage: ./deploy.sh <environment> [local-project-path]
# Requires: bash 4.0+ for associative arrays

set -e

# Check bash version (need 4.0+ for associative arrays)
if [ "${BASH_VERSION%%.*}" -lt 4 ]; then
    echo "❌ This script requires bash 4.0 or higher"
    echo "Current version: $BASH_VERSION"
    echo ""
    echo "On macOS, install newer bash:"
    echo "  brew install bash"
    echo "  /usr/local/bin/bash $0 $@"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=$1
PROJECT_PATH=${2:-"."}
CONFIG_FILE="$PROJECT_PATH/deployment.yml"
SERVER_CONFIG_FILE="$PROJECT_PATH/server-config.yml"

# Default values (will be overridden by config file)
SERVER_IP="localhost"
SERVER_USER="root"
SSH_KEY="~/.ssh/id_rsa"
SERVER_PASSWORD=""
PLATFORM_DOMAIN="ezyindustries.my.id"

# Deployment config variables
APP_NAME=""
HAS_MULTI_SERVICES=false
SERVICES=()
declare -A SERVICE_CONFIG
HEALTH_CHECK_TIMEOUT=30

# Remote paths
REMOTE_DEPLOY_DIR="/home/ezyindustries/deployments/deploy-${APP_NAME}-$$"

# Validation
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}❌ Usage: $0 <environment> [local-project-path]${NC}"
    echo -e "   Example: $0 staging ./my-project"
    echo -e "   Example: $0 production"
    exit 1
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}❌ Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 EzyIndustries Remote Deployment${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Project Path: ${GREEN}$PROJECT_PATH${NC}"
echo ""

# Function: Log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function: Error handling
error() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
    cleanup_remote
    exit 1
}

# Function: Warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Function: Acquire deployment lock
acquire_deployment_lock() {
    local lock_file="/tmp/deployment-${APP_NAME}-${ENVIRONMENT}.lock"
    if [[ -f "$lock_file" ]]; then
        local pid=$(cat "$lock_file" 2>/dev/null)
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            error "Deployment already in progress for ${APP_NAME}-${ENVIRONMENT} (PID: $pid)"
        else
            log "Removing stale lock file"
            rm -f "$lock_file"
        fi
    fi
    echo $$ > "$lock_file"
    trap "rm -f $lock_file" EXIT
}

# Function: Validate configuration
validate_config() {
    log "${YELLOW}🔍 Validating configuration...${NC}"
    
    # Check required fields
    [[ -z "$APP_NAME" ]] && error "App name is required in deployment.yml"
    [[ ! -f "$PROJECT_PATH/Dockerfile" ]] && error "Dockerfile not found in project directory"
    
    # Validate app name format (PostgreSQL compatible)
    [[ ! "$APP_NAME" =~ ^[a-zA-Z][a-zA-Z0-9_-]*$ ]] && error "Invalid app name: '$APP_NAME'. Must start with letter, contain only letters, numbers, hyphens, underscores"
    
    # Check if app name is too long (PostgreSQL limit is 63 chars)
    [[ ${#APP_NAME} -gt 50 ]] && error "App name too long (max 50 chars): '$APP_NAME'"
    
    # Validate services configuration
    for service in "${SERVICES[@]}"; do
        local port=$(get_service_config "$service" "port" "3000")
        [[ ! "$port" =~ ^[0-9]+$ ]] && error "Invalid port for service '$service': '$port'"
        [[ $port -lt 1 || $port -gt 65535 ]] && error "Port out of range for service '$service': $port"
    done
    
    echo -e "${GREEN}✅ Configuration validation passed${NC}"
}

# Function: Check server resources
check_server_resources() {
    log "${YELLOW}📊 Checking server resources...${NC}"
    
    # Check disk usage
    local disk_usage=$(remote_exec "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'" 2>/dev/null || echo "0")
    if [[ $disk_usage -gt 85 ]]; then
        warning "High disk usage: ${disk_usage}%"
    fi
    
    # Check memory usage
    local memory_usage=$(remote_exec "free | grep Mem | awk '{printf \"%.0f\", \$3/\$2*100}'" 2>/dev/null || echo "0")
    if [[ $memory_usage -gt 90 ]]; then
        warning "High memory usage: ${memory_usage}%"
    fi
    
    # Check if Docker daemon is responding
    if ! remote_exec "docker version >/dev/null 2>&1"; then
        error "Docker daemon not responding on server"
    fi
    
    echo -e "${GREEN}✅ Server resources check passed${NC}"
}

# Function: Sanitize database name
sanitize_db_name() {
    local name="$1"
    echo "${name//-/_}" | tr '[:upper:]' '[:lower:]'
}

# Function: Apply database schema
apply_database_schema() {
    local db_name="$1"
    
    # Check for schema files
    local schema_dirs=("$PROJECT_PATH/database" "$PROJECT_PATH/migrations" "$PROJECT_PATH")
    local found_schema=false
    
    for schema_dir in "${schema_dirs[@]}"; do
        if [ -d "$schema_dir" ]; then
            for schema_file in "$schema_dir"/*.sql; do
                if [ -f "$schema_file" ]; then
                    found_schema=true
                    local schema_name=$(basename "$schema_file")
                    log "Applying schema: $schema_name"
                    
                    # Upload schema file to server
                    upload_files "$schema_file" "$REMOTE_DEPLOY_DIR/$schema_name"
                    
                    # Apply schema
                    if remote_exec "docker exec postgres-platform psql -U platform_admin -d $db_name -f $REMOTE_DEPLOY_DIR/$schema_name"; then
                        echo -e "${GREEN}✅ Schema applied: $schema_name${NC}"
                    else
                        warning "Schema application failed: $schema_name (might be already applied)"
                    fi
                fi
            done
        fi
    done
    
    if [ "$found_schema" = false ]; then
        log "No database schema files found - skipping schema application"
    fi
    
    return 0
}

# Function: Build with retry mechanism
build_with_retry() {
    local dockerfile="$1"
    local image_name="$2" 
    local latest_image="$3"
    local attempts=3
    local count=0
    
    while [ $count -lt $attempts ]; do
        count=$((count + 1))
        log "Docker build attempt $count/$attempts..."
        
        if remote_exec "cd $REMOTE_DEPLOY_DIR && timeout 600 docker build -f $dockerfile -t $image_name -t $latest_image . 2>&1"; then
            echo -e "${GREEN}✅ Docker build successful on attempt $count${NC}"
            return 0
        else
            if [ $count -lt $attempts ]; then
                warning "Build failed, retrying in 10 seconds..."
                sleep 10
                
                # Clear Docker build cache on retry
                remote_exec "docker builder prune -f" || true
            fi
        fi
    done
    
    # Final fallback: try without cache
    warning "All build attempts failed, trying without cache..."
    if remote_exec "cd $REMOTE_DEPLOY_DIR && docker build --no-cache -f $dockerfile -t $image_name -t $latest_image . 2>&1"; then
        echo -e "${GREEN}✅ Docker build successful (no cache)${NC}"
        return 0
    fi
    
    return 1
}

# Function: Detailed health check
health_check_detailed() {
    local url="$1"
    local container_name="$2"
    
    log "Performing detailed health check on: $url"
    
    # Get detailed response  
    local response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo -e "\nError")
    local http_code="${response##*\n}"
    local body="${response%\n*}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed: HTTP $http_code${NC}"
        return 0
    else
        echo -e "${RED}❌ Health check failed: HTTP $http_code${NC}"
        
        if [ -n "$body" ] && [ "$body" != "Error" ]; then
            echo -e "${YELLOW}Response body:${NC}"
            echo "$body" | head -5
        fi
        
        # Show container logs
        echo -e "${YELLOW}Container logs (last 15 lines):${NC}"
        remote_exec "docker logs $container_name --tail 15" || true
        
        return 1
    fi
}

# Function: Post-deployment validation
post_deployment_validation() {
    local app_name="$1"
    local environment="$2"
    
    log "${YELLOW}🔍 Running post-deployment validation...${NC}"
    
    # 1. Check containers are running
    log "Checking containers..."
    if ! remote_exec "docker ps --filter name=$app_name --format 'table {{.Names}}\t{{.Status}}'"; then
        warning "No containers found for app: $app_name"
        return 1
    fi
    
    # 2. Check database connectivity (if required)
    local db_required=$(grep -A5 "^database:" "$CONFIG_FILE" | grep "required:" | sed 's/.*required: *\([^[:space:]]*\).*/\1/' || echo "false")
    if [ "$db_required" = "true" ]; then
        local db_name=$(sanitize_db_name "${app_name}_${environment}")
        log "Checking database connectivity..."
        if remote_exec "docker exec postgres-platform pg_isready -h localhost -p 5432 -d $db_name -U platform_admin"; then
            echo -e "${GREEN}✅ Database connectivity verified${NC}"
        else
            warning "Database connectivity check failed"
        fi
    fi
    
    echo -e "${GREEN}✅ Post-deployment validation completed${NC}"
    return 0
}

# Function: Save deployment info
save_deployment_info() {
    local info_dir="/home/ezyindustries/deployments/${APP_NAME}"
    local info_file="$info_dir/.deployment-history"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    remote_exec "mkdir -p $info_dir"
    remote_exec "echo '$timestamp|$ENVIRONMENT|${IMAGE_TAG:-latest}|success|${USER:-system}' >> $info_file"
    
    # Keep only last 50 deployments
    remote_exec "tail -50 $info_file > ${info_file}.tmp && mv ${info_file}.tmp $info_file" || true
}

# Function: Execute command on remote server
remote_exec() {
    local cmd="$1"
    
    if [ -n "$SERVER_PASSWORD" ] && command -v sshpass >/dev/null 2>&1; then
        export SSHPASS="$SERVER_PASSWORD"
        sshpass -e ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$cmd"
    elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$cmd"
    else
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$cmd"
    fi
}

# Function: Upload files to server
upload_files() {
    local local_path="$1"
    local remote_path="$2"
    
    if [ -n "$SERVER_PASSWORD" ] && command -v sshpass >/dev/null 2>&1; then
        export SSHPASS="$SERVER_PASSWORD"
        sshpass -e rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" "$local_path" "$SERVER_USER@$SERVER_IP:$remote_path"
    elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
        rsync -avz --delete -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" "$local_path" "$SERVER_USER@$SERVER_IP:$remote_path"
    else
        rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" "$local_path" "$SERVER_USER@$SERVER_IP:$remote_path"
    fi
}

# Function: Parse server config
parse_server_config() {
    if [ -f "$SERVER_CONFIG_FILE" ]; then
        log "${YELLOW}🔧 Loading server configuration...${NC}"
        
        # Parse server IP
        SERVER_IP=$(grep -A5 "^server:" "$SERVER_CONFIG_FILE" | grep "ip:" | sed 's/.*ip: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "$SERVER_IP")
        
        # Parse server user
        SERVER_USER=$(grep -A10 "^server:" "$SERVER_CONFIG_FILE" | grep "user:" | sed 's/.*user: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "$SERVER_USER")
        
        # Parse SSH key (only if not commented)
        SSH_KEY=$(grep -A10 "^server:" "$SERVER_CONFIG_FILE" | grep "^[[:space:]]*ssh_key:" | sed 's/.*ssh_key: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "$SSH_KEY")
        
        # Parse password (only if not commented)
        SERVER_PASSWORD=$(grep -A10 "^server:" "$SERVER_CONFIG_FILE" | grep "^[[:space:]]*password:" | sed 's/.*password: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "")
        
        # Parse platform domain
        PLATFORM_DOMAIN=$(grep -A5 "^platform:" "$SERVER_CONFIG_FILE" | grep "domain:" | sed 's/.*domain: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "$PLATFORM_DOMAIN")
        
        # Expand tilde in SSH key path
        if [ -n "$SSH_KEY" ]; then
            SSH_KEY="${SSH_KEY/#\~/$HOME}"
        fi
        
        echo -e "${GREEN}✅ Server config loaded:${NC}"
        echo -e "   Server: ${GREEN}$SERVER_USER@$SERVER_IP${NC}"
        if [ -n "$SSH_KEY" ]; then
            echo -e "   SSH Key: ${GREEN}$SSH_KEY${NC}"
        else
            echo -e "   Auth: ${GREEN}Password${NC}"
        fi
        echo -e "   Domain: ${GREEN}$PLATFORM_DOMAIN${NC}"
    else
        echo -e "${YELLOW}⚠️  server-config.yml not found, using defaults${NC}"
        echo -e "${YELLOW}💡 Copy template: cp templates/server-config.yml $PROJECT_PATH/${NC}"
    fi
}

# Function: Parse YAML config (simple parser for our use case)
parse_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ deployment.yml not found in $PROJECT_PATH${NC}"
        echo -e "${YELLOW}💡 Copy template: cp templates/deployment.yml $PROJECT_PATH/${NC}"
        exit 1
    fi

    log "${YELLOW}📋 Parsing deployment configuration...${NC}"

    # Parse app name
    APP_NAME=$(grep "name:" "$CONFIG_FILE" | head -1 | sed 's/.*name: *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/')
    
    if [ -z "$APP_NAME" ]; then
        echo -e "${RED}❌ App name not found in deployment.yml${NC}"
        exit 1
    fi

    # Update remote deploy dir with app name
    REMOTE_DEPLOY_DIR="/tmp/deploy-${APP_NAME}-$$"

    # Check if multi-service
    if grep -q "^services:" "$CONFIG_FILE"; then
        HAS_MULTI_SERVICES=true
        log "Multi-service configuration detected"
        
        # Parse services (simplified - assumes standard format)
        while IFS= read -r line; do
            if [[ $line =~ ^[[:space:]]*([a-zA-Z0-9_-]+):[[:space:]]*$ ]]; then
                service_name="${BASH_REMATCH[1]}"
                if [ "$service_name" != "services" ]; then
                    SERVICES+=("$service_name")
                fi
            fi
        done < <(sed -n '/^services:/,/^[^[:space:]]/p' "$CONFIG_FILE" | grep -E "^[[:space:]]+[a-zA-Z0-9_-]+:[[:space:]]*$")
    else
        HAS_MULTI_SERVICES=false
        SERVICES=("main")
        log "Single-service configuration detected"
    fi

    # Parse health check timeout
    timeout_line=$(grep "timeout:" "$CONFIG_FILE" | head -1 || echo "")
    if [ -n "$timeout_line" ]; then
        HEALTH_CHECK_TIMEOUT=$(echo "$timeout_line" | sed 's/.*timeout: *\([0-9]*\).*/\1/')
    fi

    echo -e "${GREEN}✅ Configuration parsed:${NC}"
    echo -e "   App: ${GREEN}$APP_NAME${NC}"
    echo -e "   Services: ${GREEN}${SERVICES[*]}${NC}"
    echo -e "   Multi-service: ${GREEN}$HAS_MULTI_SERVICES${NC}"
}

# Function: Test SSH connection
test_ssh_connection() {
    log "${YELLOW}🔗 Testing SSH connection...${NC}"
    
    if remote_exec "echo 'SSH connection successful'"; then
        echo -e "${GREEN}✅ SSH connection established${NC}"
    else
        echo -e "${RED}❌ SSH connection failed${NC}"
        echo -e "${YELLOW}💡 Check server IP, credentials, and network connectivity${NC}"
        exit 1
    fi
}

# Function: Validate deployment environment
validate_deployment() {
    log "${YELLOW}🔍 Validating deployment environment...${NC}"
    
    local validation_failed=0
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_PATH" ]; then
        echo -e "${RED}❌ Project directory not found: $PROJECT_PATH${NC}"
        validation_failed=1
    fi
    
    # Check for Dockerfile
    if [ ! -f "$PROJECT_PATH/Dockerfile" ]; then
        echo -e "${RED}❌ Dockerfile not found in $PROJECT_PATH${NC}"
        validation_failed=1
    else
        echo -e "${GREEN}✅ Dockerfile found${NC}"
    fi
    
    # Check if platform infrastructure is running on server
    if remote_exec "docker ps --format 'table {{.Names}}' | grep -q traefik"; then
        echo -e "${GREEN}✅ Traefik is running on server${NC}"
    else
        echo -e "${RED}❌ Traefik is not running on server${NC}"
        echo -e "${YELLOW}💡 Run on server: ./setup-platform.sh${NC}"
        validation_failed=1
    fi
    
    if remote_exec "docker ps --format 'table {{.Names}}' | grep -q postgres-platform"; then
        echo -e "${GREEN}✅ PostgreSQL is running on server${NC}"
    else
        echo -e "${RED}❌ PostgreSQL is not running on server${NC}"
        validation_failed=1
    fi
    
    if [ $validation_failed -eq 1 ]; then
        echo -e "${RED}❌ Validation failed. Please fix issues above.${NC}"
        exit 1
    fi
    
    log "${GREEN}✅ All validations passed!${NC}"
}

# Function: Upload project to server
upload_project() {
    log "${YELLOW}📤 Uploading project to server...${NC}"
    
    # Create remote directory and ensure deployments dir exists
    remote_exec "mkdir -p /home/ezyindustries/deployments"
    remote_exec "mkdir -p $REMOTE_DEPLOY_DIR"
    
    # Upload project files
    upload_files "$PROJECT_PATH/" "$REMOTE_DEPLOY_DIR/"
    
    echo -e "${GREEN}✅ Project uploaded to: $REMOTE_DEPLOY_DIR${NC}"
}

# Function: Get service config from YAML
get_service_config() {
    local service_name=$1
    local config_key=$2
    local default_value=$3
    
    if [ "$HAS_MULTI_SERVICES" = true ]; then
        # Parse multi-service config
        value=$(sed -n "/services:/,/^[^[:space:]]/p" "$CONFIG_FILE" | \
                sed -n "/$service_name:/,/^[[:space:]]*[a-zA-Z]/p" | \
                grep "$config_key:" | head -1 | \
                sed 's/.*'"$config_key"': *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "")
    else
        # Parse single-service config
        value=$(sed -n "/service:/,/^[^[:space:]]/p" "$CONFIG_FILE" | \
                grep "$config_key:" | head -1 | \
                sed 's/.*'"$config_key"': *["'"'"']*\([^"'"'"']*\)["'"'"']*.*/\1/' || echo "")
    fi
    
    if [ -z "$value" ]; then
        echo "$default_value"
    else
        echo "$value"
    fi
}

# Function: Generate subdomain
generate_subdomain() {
    local service_name=$1
    local subdomain="$APP_NAME"
    
    if [ "$ENVIRONMENT" = "staging" ]; then
        subdomain="dev-$APP_NAME"
    fi
    
    if [ "$HAS_MULTI_SERVICES" = true ] && [ "$service_name" != "main" ] && [ "$service_name" != "frontend" ]; then
        # For backend services, use same domain with path routing
        echo "$subdomain.${PLATFORM_DOMAIN}"
    else
        echo "$subdomain.${PLATFORM_DOMAIN}"
    fi
}

# Function: Generate Traefik labels for service
generate_traefik_labels() {
    local service_name=$1
    local container_name=$2
    local hostname=$3
    local port=$4
    local path=${5:-"/"}
    
    local labels=""
    
    # Basic labels
    labels+="--label traefik.enable=true "
    labels+="--label traefik.http.services.$container_name.loadbalancer.server.port=$port "
    
    # SSL labels
    labels+="--label traefik.http.routers.$container_name.entrypoints=websecure "
    labels+="--label traefik.http.routers.$container_name.tls.certresolver=letsencrypt "
    
    # HTTP redirect labels
    labels+="--label traefik.http.routers.$container_name-http.entrypoints=web "
    labels+="--label traefik.http.routers.$container_name-http.middlewares=redirect-to-https "
    
    # Routing rules
    if [ "$path" = "/" ]; then
        # Frontend or single service - catch all
        labels+="--label \"traefik.http.routers.$container_name.rule=Host(\\\`$hostname\\\`)\" "
        labels+="--label \"traefik.http.routers.$container_name-http.rule=Host(\\\`$hostname\\\`)\" "
    else
        # Backend service - path-based
        labels+="--label \"traefik.http.routers.$container_name.rule=Host(\\\`$hostname\\\`) && PathPrefix(\\\`$path\\\`)\" "
        labels+="--label \"traefik.http.routers.$container_name-http.rule=Host(\\\`$hostname\\\`) && PathPrefix(\\\`$path\\\`)\" "
    fi
    
    echo "$labels"
}

# Function: Setup database
setup_database() {
    local db_required=$(grep -A5 "^database:" "$CONFIG_FILE" | grep "required:" | sed 's/.*required: *\([^[:space:]]*\).*/\1/' || echo "false")
    
    if [ "$db_required" = "true" ]; then
        log "${YELLOW}🗄️  Setting up database on server...${NC}"
        
        local db_name=$(sanitize_db_name "${APP_NAME}_${ENVIRONMENT}")
        local db_exists=$(remote_exec "docker exec postgres-platform psql -U platform_admin -d platform -tAc \"SELECT 1 FROM pg_database WHERE datname='$db_name';\" 2>/dev/null || echo '0'")
        
        if [ "$db_exists" != "1" ]; then
            # Create database directly (can't use function in transaction)
            log "Creating database: $db_name"
            remote_exec "docker exec postgres-platform psql -U platform_admin -d postgres -c \"CREATE DATABASE ${db_name};\""
            
            # Create dedicated user for this app/environment
            local db_user="${APP_NAME}_${ENVIRONMENT}_user"
            # Replace hyphens with underscores for PostgreSQL compatibility
            db_user="${db_user//-/_}"
            local db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
            
            log "Creating database user: $db_user"
            remote_exec "docker exec postgres-platform psql -U platform_admin -d postgres -c \"CREATE USER ${db_user} WITH PASSWORD '${db_password}';\""
            remote_exec "docker exec postgres-platform psql -U platform_admin -d postgres -c \"GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${db_user};\""
            
            # Store credentials for container deployment
            export DB_USER="$db_user"
            export DB_PASSWORD="$db_password"
            
            echo -e "${GREEN}✅ Database created: $db_name${NC}"
            echo -e "${GREEN}✅ Database user created: $db_user${NC}"
            
            # Apply database schema if available
            apply_database_schema "$db_name"
        else
            echo -e "${GREEN}✅ Database already exists: $db_name${NC}"
            
            # Get existing credentials
            local db_user="${APP_NAME}_${ENVIRONMENT}_user"
            # Replace hyphens with underscores for PostgreSQL compatibility
            db_user="${db_user//-/_}"
            export DB_USER="$db_user"
            # For existing DB, we'll use platform_admin for now (should be improved)
            export DB_PASSWORD="ezyindustries_db_2025"
        fi
    fi
}

# Function: Deploy single service
deploy_service() {
    local service_name=$1
    
    # Get service configuration
    local dockerfile=$(get_service_config "$service_name" "dockerfile" "Dockerfile")
    local port=$(get_service_config "$service_name" "port" "3000")
    local path=$(get_service_config "$service_name" "path" "/")
    local health_endpoint=$(get_service_config "$service_name" "health_endpoint" "/health")
    
    # Generate names and URLs
    local container_name
    if [ "$HAS_MULTI_SERVICES" = true ]; then
        container_name="${APP_NAME}-${service_name}-${ENVIRONMENT}"
    else
        container_name="${APP_NAME}-${ENVIRONMENT}"
    fi
    
    local hostname=$(generate_subdomain "$service_name")
    local image_name="$APP_NAME-$service_name:$(date +%Y%m%d-%H%M%S)"
    local latest_image="$APP_NAME-$service_name:latest"
    
    log "${YELLOW}🚀 Deploying service: $service_name${NC}"
    echo -e "   Container: ${GREEN}$container_name${NC}"
    echo -e "   Hostname: ${GREEN}$hostname${NC}"
    echo -e "   Port: ${GREEN}$port${NC}"
    echo -e "   Path: ${GREEN}$path${NC}"
    
    # Build image on server
    log "🏗️  Building Docker image on server..."
    
    # Smart npm detection for Node.js projects
    if remote_exec "cd $REMOTE_DEPLOY_DIR && [ -f package.json ]"; then
        log "Detected Node.js project, optimizing npm install..."
        if remote_exec "cd $REMOTE_DEPLOY_DIR && npm ci --dry-run &>/dev/null"; then
            log "Using npm ci (faster, production-ready)"
        else
            log "⚠️  package-lock.json out of sync, using npm install"
            remote_exec "cd $REMOTE_DEPLOY_DIR && rm -f package-lock.json"
        fi
    fi
    
    # Build with retry mechanism
    if ! build_with_retry "$dockerfile" "$image_name" "$latest_image"; then
        echo -e "${RED}❌ Docker build failed after multiple attempts${NC}"
        log "Build error details:"
        remote_exec "cd $REMOTE_DEPLOY_DIR && docker build -f $dockerfile . 2>&1 | tail -20" || true
        return 1
    fi
    
    # Backup existing container
    if remote_exec "docker ps --format 'table {{.Names}}' | grep -q '$container_name'"; then
        log "💾 Backing up current container..."
        remote_exec "docker stop $container_name || true"
        remote_exec "docker rename $container_name $container_name-backup || true"
    fi
    
    # Generate Traefik labels
    local traefik_labels=$(generate_traefik_labels "$service_name" "$container_name" "$hostname" "$port" "$path")
    
    # Deploy new container
    log "🐳 Starting new container on server..."
    
    # Get database configuration
    local db_required=$(grep -A5 "^database:" "$CONFIG_FILE" | grep "required:" | sed 's/.*required: *\([^[:space:]]*\).*/\1/' || echo "false")
    local db_env=""
    
    if [ "$db_required" = "true" ]; then
        local db_name=$(sanitize_db_name "${APP_NAME}_${ENVIRONMENT}")
        local db_user="${DB_USER:-platform_admin}"
        local db_pass="${DB_PASSWORD:-ezyindustries_db_2025}"
        db_env="-e DATABASE_URL=postgresql://$db_user:$db_pass@postgres-platform:5432/$db_name \\
               -e DB_HOST=postgres-platform \\
               -e DB_PORT=5432 \\
               -e DB_USER=$db_user \\
               -e DB_PASSWORD=$db_pass \\
               -e DB_NAME=$db_name"
    fi
    
    # Run container with generated labels
    local docker_cmd="docker run -d \
        --name '$container_name' \
        --network $(docker network ls --format '{{.Name}}' | grep platform | head -1) \\
        --restart=unless-stopped \
        $traefik_labels \
        -e NODE_ENV='$ENVIRONMENT' \
        -e APP_ENV='$ENVIRONMENT' \
        -e PORT='$port' \
        $db_env \
        '$latest_image'"
    
    if remote_exec "$docker_cmd"; then
        echo -e "${GREEN}✅ Container deployed successfully${NC}"
    else
        echo -e "${RED}❌ Container deployment failed${NC}"
        return 1
    fi
    
    # Health check with enhanced retry logic
    log "🏥 Performing health check..."
    local health_url="https://$hostname$health_endpoint"
    local http_url="http://$hostname$health_endpoint"
    local count=0
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / 5))
    
    # Wait for container to be fully ready
    log "Waiting for container to start..."
    sleep 10
    
    # Check if container is still running
    if ! remote_exec "docker ps --format 'table {{.Names}}' | grep -q '$container_name'"; then
        echo -e "${RED}❌ Container stopped unexpectedly${NC}"
        remote_exec "docker logs $container_name --tail 20" || true
        return 1
    fi
    
    while [ $count -lt $max_attempts ]; do
        count=$((count + 1))
        
        # Try detailed health check HTTPS first, then HTTP
        if health_check_detailed "$health_url" "$container_name"; then
            # Cleanup backup
            remote_exec "docker rm $container_name-backup || true" > /dev/null 2>&1
            return 0
        elif health_check_detailed "$http_url" "$container_name"; then
            echo -e "${YELLOW}⚠️  SSL certificate still provisioning...${NC}"
            # Cleanup backup
            remote_exec "docker rm $container_name-backup || true" > /dev/null 2>&1
            return 0
        fi
        
        # Check if container is still running
        if ! remote_exec "docker ps --format 'table {{.Names}}' | grep -q '$container_name'"; then
            echo -e "${RED}❌ Container stopped during health check${NC}"
            remote_exec "docker logs $container_name --tail 20" || true
            break
        fi
        
        echo -e "${YELLOW}⏳ Health check attempt $count/$max_attempts (waiting for SSL)...${NC}"
        sleep $((count * 2))  # Exponential backoff
    done
    
    # Health check failed - rollback
    echo -e "${RED}❌ Health check failed - rolling back${NC}"
    remote_exec "docker stop $container_name || true"
    remote_exec "docker rm $container_name || true"
    
    if remote_exec "docker ps -a --format 'table {{.Names}}' | grep -q '$container_name-backup'"; then
        remote_exec "docker rename $container_name-backup $container_name || true"
        remote_exec "docker start $container_name || true"
        echo -e "${GREEN}✅ Rollback completed${NC}"
    fi
    
    return 1
}

# Function: Cleanup remote files
cleanup_remote() {
    log "${YELLOW}🧹 Cleaning up temporary files on server...${NC}"
    remote_exec "rm -rf $REMOTE_DEPLOY_DIR" || true
}

# Function: Show deployment summary
show_summary() {
    echo ""
    echo -e "${BLUE}🎉 Deployment Summary${NC}"
    echo -e "${BLUE}==================${NC}"
    echo -e "Application: ${GREEN}$APP_NAME${NC}"
    echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
    echo -e "Server: ${GREEN}$SERVER_USER@$SERVER_IP${NC}"
    echo ""
    
    for service in "${SERVICES[@]}"; do
        local hostname=$(generate_subdomain "$service")
        echo -e "Service: ${GREEN}$service${NC}"
        echo -e "  URL: ${GREEN}https://$hostname${NC}"
        
        if [ "$HAS_MULTI_SERVICES" = true ]; then
            echo -e "  Container: ${GREEN}${APP_NAME}-${service}-${ENVIRONMENT}${NC}"
        else
            echo -e "  Container: ${GREEN}${APP_NAME}-${ENVIRONMENT}${NC}"
        fi
        echo ""
    done
    
    echo -e "${BLUE}Management:${NC}"
    echo -e "  Traefik Dashboard: ${YELLOW}http://$SERVER_IP:8080${NC}"
    echo -e "  SSH to server: ${YELLOW}ssh $SERVER_USER@$SERVER_IP${NC}"
}

# Main execution
main() {
    # Parse configurations
    parse_server_config
    parse_config
    
    # Acquire deployment lock
    acquire_deployment_lock
    
    # Validate configuration
    validate_config
    
    # Test SSH connection
    test_ssh_connection
    
    # Check server resources
    check_server_resources
    
    # Validate deployment environment
    validate_deployment
    
    # Upload project to server
    upload_project
    
    # Setup database
    setup_database
    
    # Deploy all services
    local deployment_success=true
    for service in "${SERVICES[@]}"; do
        if ! deploy_service "$service"; then
            deployment_success=false
            break
        fi
    done
    
    # Cleanup
    cleanup_remote
    
    if [ "$deployment_success" = true ]; then
        # Run post-deployment validation
        if post_deployment_validation "$APP_NAME" "$ENVIRONMENT"; then
            # Save deployment info
            save_deployment_info
            
            show_summary
            echo -e "${GREEN}🎉 Remote deployment completed successfully!${NC}"
        else
            warning "Post-deployment validation failed, but deployment completed"
            show_summary
        fi
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
}

# Trap for cleanup on script exit
trap 'cleanup_remote' EXIT

# Run main function
main