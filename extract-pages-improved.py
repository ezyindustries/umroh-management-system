from bs4 import BeautifulSoup

# Read the HTML file
with open('demo-complete-umroh-app.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse HTML
soup = BeautifulSoup(content, 'html.parser')

# Extract styles
styles = soup.find_all('style')
style_content = '\n'.join([str(style) for style in styles])

# Extract common elements
material_icons = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">'
fonts = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">'

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

# Create HTML template
def create_page_template(title, page_content):
    return f'''<\!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Umroh Management System</title>
    {material_icons}
    {fonts}
    {style_content}
</head>
<body>
    <div class="container">
        {page_content}
    </div>
</body>
</html>'''

# Extract each page
for page_id, folder_name in pages.items():
    # Find the page div
    page_div = soup.find('div', {'id': page_id, 'class': 'page'})
    
    if page_div:
        # Get page title from h2 or h3
        title_elem = page_div.find(['h2', 'h3'])
        title = title_elem.text if title_elem else page_id.capitalize()
        
        # Create complete HTML page
        complete_page = create_page_template(title, str(page_div))
        
        # Save to file
        with open(f'page-backups/{folder_name}/index.html', 'w', encoding='utf-8') as f:
            f.write(complete_page)
        print(f"Extracted {page_id} page to page-backups/{folder_name}/index.html")
    else:
        print(f"Could not find {page_id} page")

print("Done extracting pages")
