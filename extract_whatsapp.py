import zipfile
import os

zip_path = "/home/ezyindustries/deployments/umroh-management/WhatsApp Chat - +62 856-1048-755.zip"
extract_path = "/home/ezyindustries/deployments/umroh-management/whatsapp_chat"

# Create extraction directory
os.makedirs(extract_path, exist_ok=True)

# Extract zip file
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    # List contents
    print("Contents of zip file:")
    for file_info in zip_ref.filelist:
        print(f"- {file_info.filename}")
    
    # Extract all files
    zip_ref.extractall(extract_path)
    print(f"\nExtracted to: {extract_path}")

# List extracted files
print("\nExtracted files:")
for root, dirs, files in os.walk(extract_path):
    for file in files:
        file_path = os.path.join(root, file)
        file_size = os.path.getsize(file_path)
        print(f"- {file} ({file_size} bytes)")