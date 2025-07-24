import re

# Read the HTML file
with open('demo-complete-umroh-app.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define page IDs and their folder names
pages = {
    'dashboard': 'dashboard',
    'jamaah': 'jamaah', 
    'packages': 'packages',
    'payments': 'payments',
    'documents': 'documents',
    'groups': 'groups',
    'groundHandling': 'ground-handling',
    'reports': 'reports',
    'excel': 'excel'
}

# Extract each page
for page_id, folder_name in pages.items():
    # Find the page div
    pattern = f'<div id="{page_id}" class="page.*?">(.*?)</div>\\s*(?=<div id=" < /dev/null | <\!-- |</div>\\s*<\!-- Main Content -->)'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        page_content = f'<div id="{page_id}" class="page">{match.group(1)}</div>'
        
        # Save to file
        with open(f'page-backups/{folder_name}/{page_id}.html', 'w', encoding='utf-8') as f:
            f.write(page_content)
        print(f"Extracted {page_id} page")
    else:
        print(f"Could not find {page_id} page")

print("Done extracting pages")
