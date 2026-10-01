import json

with open('4-Classification-Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i in range(70):
    cell = nb['cells'][i]
    cell_type = cell.get('cell_type')
    source = ''.join(cell.get('source', ''))
    # let's print interesting cells
    print(f"=== Cell {i} ({cell_type}) ===")
    print(source[:500])
    for out in cell.get('outputs', []):
        if 'text' in out:
            print("  TEXT:", ''.join(out['text'])[:300])
        if 'data' in out:
            if 'text/plain' in out['data']:
                print("  DATA:", ''.join(out['data']['text/plain'])[:300])

