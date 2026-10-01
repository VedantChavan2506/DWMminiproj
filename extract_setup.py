import json

# Let's inspect cell 53 and 56 from notebook
with open('4-Classification-Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print("CELL 53:")
print(''.join(nb['cells'][53]['source']))

print("\nCELL 56:")
print(''.join(nb['cells'][56]['source']))

print("\nCELL 68 (comparison before SMOTE):")
print(''.join(nb['cells'][68]['source']))

print("\nCELL 80 (comparison after SMOTE):")
print(''.join(nb['cells'][80]['source']))

print("\nCELL 86 (importance_df):")
print(''.join(nb['cells'][86]['source']))
