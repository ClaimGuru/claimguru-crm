
import os

def find_and_read_files(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".tsx"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r") as f:
                        content = f.read()
                        print(f"File: {file_path}")
                        print(content)
                        print("-" * 20)
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")

find_and_read_files("claimguru/src/")
