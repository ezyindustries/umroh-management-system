#!/bin/bash

# Cross-platform dependency installer for EzyIndustries Platform
# Usage: ./install-deps.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 EzyIndustries Platform - Dependency Installer${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function: Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command -v apt-get &> /dev/null; then
            DISTRO="ubuntu"
        elif command -v yum &> /dev/null; then
            DISTRO="centos"
        elif command -v pacman &> /dev/null; then
            DISTRO="arch"
        else
            DISTRO="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        DISTRO="macos"
    elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
        OS="windows"
        DISTRO="windows"
    else
        OS="unknown"
        DISTRO="unknown"
    fi
    
    echo -e "Detected OS: ${GREEN}$OS ($DISTRO)${NC}"
}

# Function: Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function: Install SSH client
install_ssh() {
    echo -e "${YELLOW}📡 Installing SSH client...${NC}"
    
    case $DISTRO in
        "ubuntu")
            sudo apt-get update
            sudo apt-get install -y openssh-client sshpass
            ;;
        "centos")
            sudo yum install -y openssh-clients sshpass
            ;;
        "arch")
            sudo pacman -S --noconfirm openssh sshpass
            ;;
        "macos")
            if ! command_exists brew; then
                echo -e "${RED}❌ Homebrew not found. Installing...${NC}"
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install sshpass
            ;;
        "windows")
            echo -e "${YELLOW}⚠️  For Windows, install Git Bash or WSL${NC}"
            echo -e "   Git Bash: https://git-scm.com/download/win"
            echo -e "   WSL: wsl --install"
            ;;
    esac
}

# Function: Install curl
install_curl() {
    echo -e "${YELLOW}🌐 Installing curl...${NC}"
    
    case $DISTRO in
        "ubuntu")
            sudo apt-get install -y curl
            ;;
        "centos")
            sudo yum install -y curl
            ;;
        "arch")
            sudo pacman -S --noconfirm curl
            ;;
        "macos")
            # curl comes pre-installed on macOS
            echo -e "${GREEN}✅ curl already available${NC}"
            ;;
        "windows")
            # curl comes with Windows 10+
            echo -e "${GREEN}✅ curl already available${NC}"
            ;;
    esac
}

# Function: Install Docker (client only for remote deployment)
install_docker_client() {
    echo -e "${YELLOW}🐳 Installing Docker client...${NC}"
    
    case $DISTRO in
        "ubuntu")
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce-cli
            ;;
        "centos")
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce-cli
            ;;
        "arch")
            sudo pacman -S --noconfirm docker
            ;;
        "macos")
            if ! command_exists docker; then
                echo -e "${YELLOW}⚠️  Install Docker Desktop for Mac${NC}"
                echo -e "   Download: https://desktop.docker.com/mac/main/amd64/Docker.dmg"
                open "https://desktop.docker.com/mac/main/amd64/Docker.dmg"
            else
                echo -e "${GREEN}✅ Docker already installed${NC}"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}⚠️  Install Docker Desktop for Windows${NC}"
            echo -e "   Download: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            ;;
    esac
}

# Function: Install rsync
install_rsync() {
    echo -e "${YELLOW}🔄 Installing rsync...${NC}"
    
    case $DISTRO in
        "ubuntu")
            sudo apt-get install -y rsync
            ;;
        "centos")
            sudo yum install -y rsync
            ;;
        "arch")
            sudo pacman -S --noconfirm rsync
            ;;
        "macos")
            # rsync comes pre-installed on macOS
            echo -e "${GREEN}✅ rsync already available${NC}"
            ;;
        "windows")
            echo -e "${YELLOW}⚠️  rsync available in Git Bash or WSL${NC}"
            ;;
    esac
}

# Function: Verify installations
verify_deps() {
    echo -e "${YELLOW}🔍 Verifying installations...${NC}"
    
    local all_good=true
    
    # Check SSH
    if command_exists ssh; then
        echo -e "${GREEN}✅ SSH client installed${NC}"
    else
        echo -e "${RED}❌ SSH client not found${NC}"
        all_good=false
    fi
    
    # Check sshpass (not critical, but preferred)
    if command_exists sshpass; then
        echo -e "${GREEN}✅ sshpass installed${NC}"
    else
        echo -e "${YELLOW}⚠️  sshpass not found (password auth won't work)${NC}"
    fi
    
    # Check curl
    if command_exists curl; then
        echo -e "${GREEN}✅ curl installed${NC}"
    else
        echo -e "${RED}❌ curl not found${NC}"
        all_good=false
    fi
    
    # Check Docker (optional for client)
    if command_exists docker; then
        echo -e "${GREEN}✅ Docker client available${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker client not found (optional)${NC}"
    fi
    
    # Check rsync
    if command_exists rsync; then
        echo -e "${GREEN}✅ rsync installed${NC}"
    else
        echo -e "${RED}❌ rsync not found${NC}"
        all_good=false
    fi
    
    if [ "$all_good" = true ]; then
        echo -e "${GREEN}🎉 All dependencies installed successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some dependencies missing${NC}"
        return 1
    fi
}

# Main installation
main() {
    detect_os
    
    echo ""
    echo -e "${BLUE}📦 Installing required dependencies...${NC}"
    
    # Install SSH client and sshpass
    if ! command_exists ssh || ! command_exists sshpass; then
        install_ssh
    else
        echo -e "${GREEN}✅ SSH tools already installed${NC}"
    fi
    
    # Install curl
    if ! command_exists curl; then
        install_curl
    else
        echo -e "${GREEN}✅ curl already installed${NC}"
    fi
    
    # Install Docker client (optional)
    if ! command_exists docker; then
        echo -e "${YELLOW}🐳 Docker client not found. Install? (y/n)${NC}"
        read -r install_docker
        if [[ $install_docker =~ ^[Yy]$ ]]; then
            install_docker_client
        fi
    else
        echo -e "${GREEN}✅ Docker already installed${NC}"
    fi
    
    # Install rsync
    if ! command_exists rsync; then
        install_rsync
    else
        echo -e "${GREEN}✅ rsync already installed${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔍 Final verification...${NC}"
    if verify_deps; then
        echo ""
        echo -e "${GREEN}🎉 Setup completed! You can now run deployments.${NC}"
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "   1. Copy templates: cp templates/*.yml ./my-project/"
        echo -e "   2. Edit configs: vim my-project/server-config.yml"
        echo -e "   3. Deploy: ./scripts/deploy.sh staging ./my-project"
    else
        echo ""
        echo -e "${RED}❌ Installation incomplete. Please fix issues above.${NC}"
        exit 1
    fi
}

# Run main function
main