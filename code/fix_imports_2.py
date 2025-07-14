
import os

def fix_imports(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".tsx"):
            filepath = os.path.join(directory, filename)
            with open(filepath, "r") as f:
                lines = f.readlines()

            with open(filepath, "w") as f:
                for line in lines:
                    if "from '../components/ui/" in line:
                        line = line.replace("from '../components/ui/", "from '../../components/ui/")
                    f.write(line)

fix_imports("claimguru/src/pages")
