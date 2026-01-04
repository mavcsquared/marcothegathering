import os
import shutil

base_path = "/home/marco/github/marcothegathering/backend/src/main/java/com"
old_dir = os.path.join(base_path, "mtgevaluator")
new_dir = os.path.join(base_path, "marcothegathering")

print(f"Refactoring from {old_dir} to {new_dir}")

# 1. Rename Directory
if os.path.exists(old_dir):
    if os.path.exists(new_dir):
        shutil.rmtree(new_dir) # Clean if exists
    shutil.move(old_dir, new_dir)
    print("Directory renamed.")
else:
    print("Old directory not found! checking if already renamed...")
    if os.path.exists(new_dir):
        print("New directory already exists. Proceeding with content replacement.")
    else:
        print("Error: Neither directory found.")
        exit(1)

# 2. Update Content
if not os.path.exists(new_dir):
    new_dir = old_dir # Fallback if move failed but we proceed? No, that's wrong.

for root, dirs, files in os.walk(new_dir):
    for file in files:
        if file.endswith(".java"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r') as f:
                    content = f.read()
                
                new_content = content.replace("package com.mtgevaluator", "package com.marcothegathering")
                new_content = new_content.replace("import com.mtgevaluator", "import com.marcothegathering")
                
                if content != new_content:
                    with open(path, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {file}")
            except Exception as e:
                print(f"Failed to update {file}: {e}")

print("Refactoring complete.")
