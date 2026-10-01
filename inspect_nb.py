import json
import os

with open('4-Classification-Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}")
for i, cell in enumerate(nb['cells']):
    source = ''.join(cell.get('source', ''))
    cell_type = cell.get('cell_type')
    keywords = ['xgb', 'smote', 'confusion_matrix', 'roc', 'feature_importance', 'rf', 'dt', 'lr', 'corr', 'read_csv', 'accuracy', 'precision', 'recall', 'f1', 'columns']
    matched = [k for k in keywords if k in source.lower()]
    if matched or cell_type == 'markdown':
        print(f"--- Cell {i} ({cell_type}) [matched: {matched}] ---")
        lines = source.strip().split('\n')
        for l in lines[:5]:
            print(f"  src: {l}")
        if len(lines) > 5:
            print(f"  ... (+{len(lines)-5} lines)")
        for out in cell.get('outputs', []):
            if 'text' in out:
                out_lines = ''.join(out['text']).strip().split('\n')
                for ol in out_lines[:5]:
                    print(f"  out: {ol}")
                if len(out_lines) > 5:
                    print(f"  ... (+{len(out_lines)-5} lines)")
            if 'data' in out:
                for mime, data in out['data'].items():
                    if mime == 'text/plain':
                        data_lines = ''.join(data).strip().split('\n')
                        for dl in data_lines[:4]:
                            print(f"  data/plain: {dl}")

