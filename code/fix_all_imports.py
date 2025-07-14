
import os

def fix_import_paths(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()

                new_content = content
                lines = new_content.split('\n')
                for i, line in enumerate(lines):
                    if 'from \'../ui/' in line or 'from \'../../ui/' in line:
                        parts = line.split(' ')
                        for j, part in enumerate(parts):
                            if '../ui/' in part or '../../ui/' in part:
                                component_name = part.split('/')[-1].replace("'", "").replace('"', '').replace(';', '')
                                new_component_name = component_name.lower()
                                parts[j] = part.replace(component_name, new_component_name)
                        lines[i] = ' '.join(parts)
                
                new_content = '\n'.join(lines)

                if new_content != content:
                    with open(file_path, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed import paths in {file_path}")

fix_import_paths("claimguru/src/")
