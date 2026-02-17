
import os
import glob

# Paths
BASE_DIR = '/home/jj/Desktop/ilytat_hq/ilytat_common_packages/packages/ilytat-theme/themes'

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == ',':
            # Append comma to the previous line
            if new_lines:
                # Remove newline from previous line
                prev = new_lines.pop().rstrip('\n')
                new_lines.append(prev + ',\n')
            continue
        
        # Also clean up double commas or {,
        cleaned = line.replace(',,', ',').replace('{,', '{')
        new_lines.append(cleaned)
    
    content = ''.join(lines)
    new_content = ''.join(new_lines)
    
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Fixed.")
    else:
        print("No changes needed.")

def main():
    files = glob.glob(os.path.join(BASE_DIR, '*', 'index.ts'))
    for f in files:
        fix_file(f)

if __name__ == '__main__':
    main()
