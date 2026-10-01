import json

with open('bank_ml_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ts_content = f"""// Generated from bank-additional-full.csv (41,188 rows, 12 duplicates removed = 41,176 clean rows)
import {{ RateItem, BoxPlotStats, DatasetRow }} from '../types';

export const DATASET_SUMMARY = {json.dumps(data['summary'], indent=2)};

export const AGE_DATA: {{ ageGroup: string; rate: number; yes: number; no: number; total: number }}[] = {json.dumps(data['ageData'], indent=2)};

export const JOB_DATA: RateItem[] = {json.dumps(data['jobData'], indent=2)};

export const DURATION_STATS: {{ yes: BoxPlotStats; no: BoxPlotStats }} = {json.dumps(data['durationStats'], indent=2)};

export const MARITAL_DATA: RateItem[] = {json.dumps(data['maritalData'], indent=2)};

export const HOUSING_DATA: RateItem[] = {json.dumps(data['housingData'], indent=2)};

export const LOAN_DATA: RateItem[] = {json.dumps(data['loanData'], indent=2)};

export const CONTACT_DATA: RateItem[] = {json.dumps(data['contactData'], indent=2)};

export const POUTCOME_DATA: RateItem[] = {json.dumps(data['poutcomeData'], indent=2)};

export const MONTH_DATA: RateItem[] = {json.dumps(data['monthData'], indent=2)};

export const EURIBOR_DATA: {{ range: string; rate: number; yes: number; no: number; total: number }}[] = {json.dumps(data['euriborData'], indent=2)};

export const CAMPAIGN_CONTACTS_DATA: {{ contacts: string; rate: number; yes: number; no: number; total: number }}[] = {json.dumps(data['campaignData'], indent=2)};

export const PREVIOUS_CONTACTS_DATA: {{ previous: string; rate: number; yes: number; no: number; total: number }}[] = {json.dumps(data['previousData'], indent=2)};

export const CORRELATION_KEYS = {json.dumps(data['corrKeys'], indent=2)};

export const CORRELATION_MATRIX: Record<string, Record<string, number>> = {json.dumps(data['corrMatrix'], indent=2)};

export const SAMPLE_DATASET_ROWS: DatasetRow[] = {json.dumps(data['sampleRows'], indent=2)};
"""

with open('src/data/bankData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Generated src/data/bankData.ts successfully!")

