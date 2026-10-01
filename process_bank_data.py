import csv
import math
import json
from collections import defaultdict

filename = 'bank-additional-full.csv'

rows = []
seen = set()
duplicates = 0

with open(filename, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for r in reader:
        row_tuple = tuple(r.items())
        if row_tuple in seen:
            duplicates += 1
            continue
        seen.add(row_tuple)
        rows.append(r)

print(f"Total rows read: {len(rows)}, Duplicates removed: {duplicates}")

# 1. Target distribution
target_counts = defaultdict(int)
for r in rows:
    target_counts[r['y']] += 1

print("Target distribution:", dict(target_counts))

# Helper to calculate subscription rate
def calc_rate(group_dict):
    res = []
    for k, v in group_dict.items():
        total = v['yes'] + v['no']
        rate = (v['yes'] / total * 100) if total > 0 else 0
        res.append({
            'category': k,
            'yes': v['yes'],
            'no': v['no'],
            'total': total,
            'rate': round(rate, 2)
        })
    return res

# 2. Age groups (bins: 18-25, 26-35, 36-45, 46-55, 55+)
def get_age_group(age):
    age = int(age)
    if age <= 25: return '18-25'
    elif age <= 35: return '26-35'
    elif age <= 45: return '36-45'
    elif age <= 55: return '46-55'
    else: return '55+'

age_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    grp = get_age_group(r['age'])
    age_groups[grp][r['y']] += 1

age_order = ['18-25', '26-35', '36-45', '46-55', '55+']
age_data = [
    {
        'ageGroup': grp,
        'rate': round(age_groups[grp]['yes'] / (age_groups[grp]['yes'] + age_groups[grp]['no']) * 100, 2),
        'yes': age_groups[grp]['yes'],
        'no': age_groups[grp]['no'],
        'total': age_groups[grp]['yes'] + age_groups[grp]['no']
    }
    for grp in age_order
]

# 3. Job categories
job_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    job_groups[r['job']][r['y']] += 1

job_data = calc_rate(job_groups)
job_data.sort(key=lambda x: x['rate'], reverse=True)

# 4. Call Duration stats (box plot info for yes and no)
duration_yes = [float(r['duration']) for r in rows if r['y'] == 'yes']
duration_no = [float(r['duration']) for r in rows if r['y'] == 'no']

def get_box_stats(arr):
    arr = sorted(arr)
    n = len(arr)
    def pct(p):
        k = (n - 1) * p
        f = math.floor(k)
        c = math.ceil(k)
        if f == c: return arr[int(k)]
        return arr[f] * (c - k) + arr[c] * (k - f)
    mean = sum(arr) / n
    q1 = pct(0.25)
    median = pct(0.50)
    q3 = pct(0.75)
    iqr = q3 - q1
    min_val = max(arr[0], q1 - 1.5 * iqr)
    max_val = min(arr[-1], q3 + 1.5 * iqr)
    return {
        'min': round(min_val, 1),
        'q1': round(q1, 1),
        'median': round(median, 1),
        'q3': round(q3, 1),
        'max': round(max_val, 1),
        'mean': round(mean, 1),
        'count': n
    }

duration_stats = {
    'yes': get_box_stats(duration_yes),
    'no': get_box_stats(duration_no)
}

# 5. Marital status
marital_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    marital_groups[r['marital']][r['y']] += 1
marital_data = calc_rate(marital_groups)
marital_data.sort(key=lambda x: x['rate'], reverse=True)

# 6. Housing loan
housing_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    housing_groups[r['housing']][r['y']] += 1
housing_data = calc_rate(housing_groups)

# 7. Personal loan
loan_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    loan_groups[r['loan']][r['y']] += 1
loan_data = calc_rate(loan_groups)

# 8. Contact type
contact_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    contact_groups[r['contact']][r['y']] += 1
contact_data = calc_rate(contact_groups)

# 9. Previous outcome (poutcome)
poutcome_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    poutcome_groups[r['poutcome']][r['y']] += 1
poutcome_data = calc_rate(poutcome_groups)
poutcome_data.sort(key=lambda x: x['rate'], reverse=True)

# 10. Month
month_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    month_groups[r['month']][r['y']] += 1
month_order = ['mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
month_data = [
    {
        'category': m,
        'rate': round(month_groups[m]['yes'] / (month_groups[m]['yes'] + month_groups[m]['no']) * 100, 2) if (month_groups[m]['yes'] + month_groups[m]['no']) > 0 else 0,
        'yes': month_groups[m]['yes'],
        'no': month_groups[m]['no'],
        'total': month_groups[m]['yes'] + month_groups[m]['no']
    }
    for m in month_order
]

# 11. Euribor3m ranges (0-1, 1-2, 2-3, 3-4, 4-5, 5-6)
def get_euribor_range(val):
    v = float(val)
    if v <= 1: return '0-1'
    elif v <= 2: return '1-2'
    elif v <= 3: return '2-3'
    elif v <= 4: return '3-4'
    elif v <= 5: return '4-5'
    else: return '5-6'

euribor_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    euribor_groups[get_euribor_range(r['euribor3m'])][r['y']] += 1
eur_order = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6']
euribor_data = [
    {
        'range': grp,
        'rate': round(euribor_groups[grp]['yes'] / (euribor_groups[grp]['yes'] + euribor_groups[grp]['no']) * 100, 2) if (euribor_groups[grp]['yes'] + euribor_groups[grp]['no']) > 0 else 0,
        'yes': euribor_groups[grp]['yes'],
        'no': euribor_groups[grp]['no'],
        'total': euribor_groups[grp]['yes'] + euribor_groups[grp]['no']
    }
    for grp in eur_order
]

# 12. Campaign contacts vs subscription
campaign_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    c = int(r['campaign'])
    lbl = str(c) if c <= 5 else '6+'
    campaign_groups[lbl][r['y']] += 1
camp_order = ['1', '2', '3', '4', '5', '6+']
campaign_data = [
    {
        'contacts': c,
        'rate': round(campaign_groups[c]['yes'] / (campaign_groups[c]['yes'] + campaign_groups[c]['no']) * 100, 2) if (campaign_groups[c]['yes'] + campaign_groups[c]['no']) > 0 else 0,
        'yes': campaign_groups[c]['yes'],
        'no': campaign_groups[c]['no'],
        'total': campaign_groups[c]['yes'] + campaign_groups[c]['no']
    }
    for c in camp_order
]

# 13. Previous contacts vs subscription
prev_groups = defaultdict(lambda: {'yes': 0, 'no': 0})
for r in rows:
    p = int(r['previous'])
    lbl = str(p) if p <= 2 else '3+'
    prev_groups[lbl][r['y']] += 1
prev_order = ['0', '1', '2', '3+']
prev_data = [
    {
        'previous': p,
        'rate': round(prev_groups[p]['yes'] / (prev_groups[p]['yes'] + prev_groups[p]['no']) * 100, 2) if (prev_groups[p]['yes'] + prev_groups[p]['no']) > 0 else 0,
        'yes': prev_groups[p]['yes'],
        'no': prev_groups[p]['no'],
        'total': prev_groups[p]['yes'] + prev_groups[p]['no']
    }
    for p in prev_order
]

# 14. Correlation matrix among numerical variables
num_keys = ['age', 'duration', 'campaign', 'pdays', 'previous', 'emp.var.rate', 'cons.price.idx', 'cons.conf.idx', 'euribor3m', 'nr.employed']
# Also include y (0 or 1)
num_keys_with_y = num_keys + ['y_encoded']

# Extract values
matrix_data = {k: [] for k in num_keys_with_y}
for r in rows:
    for k in num_keys:
        matrix_data[k].append(float(r[k]))
    matrix_data['y_encoded'].append(1.0 if r['y'] == 'yes' else 0.0)

def pearson(x, y):
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    var_x = sum((x[i] - mean_x) ** 2 for i in range(n))
    var_y = sum((y[i] - mean_y) ** 2 for i in range(n))
    denom = math.sqrt(var_x * var_y)
    return round(cov / denom, 3) if denom > 0 else 0

corr_matrix = {}
for k1 in num_keys_with_y:
    corr_matrix[k1] = {}
    for k2 in num_keys_with_y:
        corr_matrix[k1][k2] = pearson(matrix_data[k1], matrix_data[k2])

# 15. Sample dataset rows (first 100 rows for searchable table)
sample_rows = rows[:100]

final_export = {
    'summary': {
        'totalRows': 41188,
        'duplicatesRemoved': 12,
        'cleanRows': 41176,
        'subscribersYes': target_counts['yes'],
        'subscribersNo': target_counts['no'],
        'subscriptionRate': round(target_counts['yes'] / len(rows) * 100, 2),
    },
    'ageData': age_data,
    'jobData': job_data,
    'durationStats': duration_stats,
    'maritalData': marital_data,
    'housingData': housing_data,
    'loanData': loan_data,
    'contactData': contact_data,
    'poutcomeData': poutcome_data,
    'monthData': month_data,
    'euriborData': euribor_data,
    'campaignData': campaign_data,
    'previousData': prev_data,
    'corrMatrix': corr_matrix,
    'corrKeys': num_keys_with_y,
    'sampleRows': sample_rows
}

with open('bank_ml_data.json', 'w', encoding='utf-8') as f:
    json.dump(final_export, f, indent=2)

print("Saved bank_ml_data.json successfully!")

