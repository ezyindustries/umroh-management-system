# Group Management Feature Documentation

## Overview
Sistem manajemen grup untuk mengorganisir jamaah dalam rombongan keberangkatan, memudahkan koordinasi, dan manajemen operasional selama perjalanan umroh.

## Current Implementation Status
⚠️ **Partially Implemented** - Basic UI tersedia, fitur grouping belum lengkap

## User Interface

### Group Management Page
Halaman untuk membuat dan mengelola grup jamaah.

#### Main Features
1. **Group Creation**
   - Nama grup (e.g., "Al-Barokah 1")
   - Pilih package
   - Tentukan ketua rombongan
   - Set kapasitas grup

2. **Member Management**
   - Drag & drop jamaah ke grup
   - Auto-grouping berdasarkan keluarga
   - Manual assignment
   - Bulk operations

3. **Group Overview**
   - Visual card display
   - Member count indicators
   - Progress bars
   - Quick actions

4. **Group Details**
   - Member list dengan foto
   - Contact information
   - Document status
   - Payment status

## Group Types

### 1. Departure Groups
Grup berdasarkan keberangkatan
- Max 45 orang per grup
- Satu muthawif per grup
- Pembagian bus
- Rooming coordination

### 2. Family Groups
Grup keluarga otomatis
- Auto-detect family relations
- Keep families together
- Mahram considerations
- Room sharing preferences

### 3. Regional Groups
Grup berdasarkan daerah
- Same city/region
- Easier coordination
- Pre-departure meetings
- Local representatives

## Workflow

### Group Creation Flow
```javascript
1. Select package
2. Create group structure:
   - Name the group
   - Set capacity
   - Assign leader
3. Add members:
   - Auto-suggest families
   - Manual selection
   - Drag & drop interface
4. Validate:
   - Check mahram rules
   - Verify capacity
   - Balance gender ratio
5. Finalize group
6. Generate documents
```

### Auto-Grouping Algorithm
```javascript
function autoCreateGroups(packageId) {
    // Get all jamaah for package
    const jamaahList = getJamaahByPackage(packageId);
    
    // Group by families first
    const families = groupByFamilies(jamaahList);
    
    // Create groups with constraints
    const groups = [];
    let currentGroup = createNewGroup();
    
    for (const family of families) {
        if (canAddToGroup(currentGroup, family)) {
            currentGroup.addFamily(family);
        } else {
            groups.push(currentGroup);
            currentGroup = createNewGroup();
            currentGroup.addFamily(family);
        }
    }
    
    // Handle single jamaah
    distributeSingles(groups, singles);
    
    return groups;
}
```

## Technical Implementation

### Database Schema
```sql
CREATE TABLE groups.departure_groups (
    id SERIAL PRIMARY KEY,
    kode_grup VARCHAR(50) UNIQUE,
    nama_grup VARCHAR(255) NOT NULL,
    package_id INTEGER REFERENCES core.packages(id),
    muthawif_id INTEGER REFERENCES jamaah.jamaah_data(id),
    capacity INTEGER DEFAULT 45,
    current_members INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER
);

CREATE TABLE groups.group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups.departure_groups(id),
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    role VARCHAR(50) DEFAULT 'member', -- leader, coordinator, member
    joined_at TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    UNIQUE(group_id, jamaah_id)
);

CREATE TABLE groups.group_coordinators (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups.departure_groups(id),
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    responsibility VARCHAR(100), -- bus_coordinator, room_coordinator, etc
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (To Be Implemented)
```javascript
// Group CRUD
GET /api/groups
POST /api/groups
GET /api/groups/:id
PUT /api/groups/:id
DELETE /api/groups/:id

// Member management
POST /api/groups/:id/members
DELETE /api/groups/:id/members/:jamaahId
PUT /api/groups/:id/members/:jamaahId

// Auto grouping
POST /api/groups/auto-create
Body: { packageId, strategy: 'family' | 'region' | 'balanced' }

// Group operations
POST /api/groups/:id/finalize
GET /api/groups/:id/documents
GET /api/groups/:id/manifest
```

## UI Components

### Group Card
```html
<div class="group-card glass-card">
    <div class="group-header">
        <h3>Al-Barokah 1</h3>
        <span class="group-code">GRP-2024-001</span>
    </div>
    <div class="group-stats">
        <div class="stat">
            <i class="material-icons">people</i>
            <span>40/45</span>
        </div>
        <div class="stat">
            <i class="material-icons">male</i>
            <span>22</span>
        </div>
        <div class="stat">
            <i class="material-icons">female</i>
            <span>18</span>
        </div>
    </div>
    <div class="group-leader">
        <img src="leader-photo.jpg" class="leader-avatar">
        <div>
            <p class="leader-name">H. Ahmad Fauzi</p>
            <p class="leader-role">Ketua Rombongan</p>
        </div>
    </div>
    <div class="progress-bar">
        <div class="progress" style="width: 89%"></div>
    </div>
    <div class="group-actions">
        <button class="glass-button-small">View Members</button>
        <button class="glass-button-small">Edit</button>
    </div>
</div>
```

### Member Assignment Interface
```html
<div class="member-assignment">
    <div class="available-jamaah">
        <h4>Available Jamaah</h4>
        <div class="search-box">
            <input type="text" placeholder="Search jamaah...">
        </div>
        <div class="jamaah-list">
            <!-- Draggable jamaah cards -->
        </div>
    </div>
    <div class="drop-zone">
        <div class="group-drop-area">
            <h4>Al-Barokah 1</h4>
            <div class="members-grid">
                <!-- Dropped members -->
            </div>
        </div>
    </div>
</div>
```

## Features to Implement

### 1. Smart Grouping
- AI-based optimal grouping
- Consider preferences
- Balance demographics
- Minimize conflicts

### 2. Communication Tools
- Group broadcast messages
- WhatsApp group creation
- Emergency contacts list
- Group chat integration

### 3. Operational Management
- Bus seat allocation
- Hotel room grouping
- Meal group arrangements
- Meeting point coordination

### 4. Documents Generation
- Group manifest
- Emergency contact sheets
- Room allocation lists
- Bus seating charts
- Muthawif handbook

### 5. Real-time Tracking
- GPS tracking per group
- Check-in/out system
- Headcount management
- Lost member alerts

## Group Constraints & Rules

### Mahram Rules
```javascript
const mahramRules = {
    // Women must have mahram in same group
    validateMahram: (group) => {
        const women = group.members.filter(m => m.gender === 'female');
        for (const woman of women) {
            if (!hasMahramInGroup(woman, group)) {
                return { valid: false, reason: `${woman.name} needs mahram` };
            }
        }
        return { valid: true };
    }
};
```

### Capacity Rules
- Min: 20 people per group
- Max: 45 people per group
- Balanced gender ratio
- Age distribution consideration

### Special Requirements
- Wheelchair users together
- Elderly care groups
- Medical needs grouping
- Language preferences

## Integration Points

### With Package Management
- Auto-create groups on package creation
- Sync departure dates
- Update group status

### With Hotel Management
- Room allocation by group
- Floor assignment
- Special requests

### With Transportation
- Bus assignment
- Seat allocation
- Airport coordination

### With Documents
- Group document checklist
- Bulk document verification
- Missing document alerts

## Reports & Analytics

### Group Reports
1. **Group Manifest**
   - Complete member list
   - Contact information
   - Document status
   - Special needs

2. **Operational Reports**
   - Bus assignments
   - Room allocations
   - Meal arrangements
   - Emergency contacts

3. **Statistical Reports**
   - Demographics per group
   - Regional distribution
   - Family groupings
   - Special needs summary

### Analytics Dashboard
- Group fill rates
- Average group size
- Demographics distribution
- Grouping efficiency metrics

## Mobile Features (Future)

### Group Leader App
- Member check-in/out
- Emergency broadcasts
- GPS sharing
- Document access
- Communication hub

### Member Features
- View group info
- Contact group members
- Emergency button
- Location sharing
- Schedule access

## Best Practices

### For Group Creation
1. Start with family units
2. Consider regional proximity
3. Balance demographics
4. Assign experienced leaders
5. Document special needs

### For Operations
1. Brief group leaders thoroughly
2. Provide emergency protocols
3. Regular headcounts
4. Clear communication channels
5. Backup coordinators

## Troubleshooting

### Common Issues

1. **Unbalanced Groups**
   - Review auto-grouping settings
   - Manual adjustments
   - Consider constraints

2. **Mahram Violations**
   - Check family relations
   - Reassign members
   - Update mahram data

3. **Capacity Issues**
   - Split large families
   - Combine small groups
   - Adjust constraints

## Future Enhancements

### 1. ML-Powered Grouping
- Learn from past groupings
- Predict compatible groups
- Optimize satisfaction
- Reduce conflicts

### 2. Advanced Coordination
- Real-time location sharing
- Automated headcounts
- Smart notifications
- Predictive alerts

### 3. Integration Expansions
- Travel agency systems
- Airlines group check-in
- Hotel PMS integration
- Government portals