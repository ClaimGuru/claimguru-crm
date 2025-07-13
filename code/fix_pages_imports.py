
import os
import re

def fix_import_paths(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    with open(file_path, 'r', encoding='latin-1') as f:
                        content = f.read()

                # Correct the relative paths
                content = re.sub(r"from '..\/components\/ui\/(.*?)'", r"from '../../components/ui/\\1'", content)

                # Correct the casing of the imports
                content = content.replace("from '../../components/ui/Button'", "from '../../components/ui/button'")
                content = content.replace("from '../../components/ui/Card'", "from '../../components/ui/card'")
                content = content.replace("from '../../components/ui/LoadingSpinner'", "from '../../components/ui/loadingspinner'")
                content = content.replace("from '../../components/ui/FileImportExport'", "from '../../components/ui/fileimportexport'")
                content = content.replace("from '../../components/ui/Input'", "from '../../components/ui/input'")
                content = content.replace("from '../../components/ui/Badge'", "from '../../components/ui/badge'")

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed import paths in {file_path}")

if __name__ == "__main__":
    fix_import_paths("claimguru/src/pages")
