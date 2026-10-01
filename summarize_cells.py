import json

with open('4-Classification-Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    source = ''.join(cell.get('source', ''))
    outputs = cell.get('outputs', [])
    print(f"CELL {i} ({cell.get('cell_type')}):")
    for line in source.strip().split('\n')[:4]:
        print(f"  src: {line}")
    for out in outputs:
        if 'text' in out:
            txt = ''.join(out['text']).strip()
            print(f"  out_text: {txt[:200]}")
        if 'data' in out:
            for k in ['text/plain', 'text/html']:
                if k in out['data']:
                    txt = ''.join(out['data'][k]).strip()
                    print(f"  data_{k}: {txt[:200]}")

