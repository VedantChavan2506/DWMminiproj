import json

with open('4-Classification-Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for c_idx in [80, 84, 86, 87]:
    cell = nb['cells'][c_idx]
    print(f"=== Cell {c_idx} ===")
    for out in cell.get('outputs', []):
        if 'text' in out:
            print('TEXT:', ''.join(out['text']))
        if 'data' in out:
            for k, v in out['data'].items():
                print(f"DATA {k}:", ''.join(v) if isinstance(v, list) else v)

