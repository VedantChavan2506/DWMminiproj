import { ModelMetric, ConfusionMatrixData, FeatureImportance } from '../types';

export const MODELS_BEFORE_SMOTE: ModelMetric[] = [
  {
    model: 'Logistic Regression',
    accuracy: 0.907722,
    precision: 0.654982,
    recall: 0.382543,
    f1: 0.482993,
    auc: 0.8842
  },
  {
    model: 'Decision Tree',
    accuracy: 0.913307,
    precision: 0.624130,
    recall: 0.579741,
    f1: 0.601117,
    auc: 0.8925
  },
  {
    model: 'Random Forest',
    accuracy: 0.910636,
    precision: 0.632964,
    recall: 0.492457,
    f1: 0.553939,
    auc: 0.9231
  },
  {
    model: 'XGBoost',
    accuracy: 0.918771,
    precision: 0.667964,
    recall: 0.554957,
    f1: 0.606239,
    auc: 0.9380
  }
];

export const MODELS_AFTER_SMOTE: ModelMetric[] = [
  {
    model: 'Logistic Regression',
    accuracy: 0.887203,
    precision: 0.499633,
    recall: 0.732759,
    f1: 0.594146,
    auc: 0.9120
  },
  {
    model: 'Decision Tree',
    accuracy: 0.889995,
    precision: 0.507768,
    recall: 0.774784,
    f1: 0.613481,
    auc: 0.9045
  },
  {
    model: 'Random Forest',
    accuracy: 0.905901,
    precision: 0.571966,
    recall: 0.655172,
    f1: 0.610748,
    auc: 0.9348
  },
  {
    model: 'XGBoost',
    accuracy: 0.907479,
    precision: 0.564142,
    recall: 0.786638,
    f1: 0.657066,
    auc: 0.9448
  }
];

export const XGBOOST_FINAL_METRICS = {
  accuracy: 0.907479,
  precision: 0.564142,
  recall: 0.786638,
  f1: 0.657066,
  auc: 0.9448
};

export const XGBOOST_CONFUSION_MATRIX: ConfusionMatrixData = {
  tn: 6744,
  fp: 564,
  fn: 198,
  tp: 730
};

export const SMOTE_DISTRIBUTION = {
  before: {
    no: 29229,
    yes: 3711,
    total: 32940,
    rate: 11.27
  },
  after: {
    no: 29229,
    yes: 14614,
    total: 43843,
    rate: 33.33
  }
};

export const TOP_10_FEATURES: FeatureImportance[] = [
  {
    feature: 'num__duration',
    importance: 0.294813,
    label: 'Call Duration (sec)',
    category: 'Call Details'
  },
  {
    feature: 'num__euribor3m',
    importance: 0.171300,
    label: 'Euribor 3M Rate',
    category: 'Economic'
  },
  {
    feature: 'num__campaign',
    importance: 0.089046,
    label: 'Campaign Contacts',
    category: 'Campaign History'
  },
  {
    feature: 'cat__job_blue-collar',
    importance: 0.071411,
    label: 'Job: Blue-Collar',
    category: 'Customer Profile'
  },
  {
    feature: 'cat__poutcome_success',
    importance: 0.059501,
    label: 'Prev. Outcome: Success',
    category: 'Campaign History'
  },
  {
    feature: 'cat__poutcome_failure',
    importance: 0.057703,
    label: 'Prev. Outcome: Failure',
    category: 'Campaign History'
  },
  {
    feature: 'num__age',
    importance: 0.031619,
    label: 'Customer Age',
    category: 'Customer Profile'
  },
  {
    feature: 'cat__contact_cellular',
    importance: 0.031389,
    label: 'Contact: Cellular',
    category: 'Call Details'
  },
  {
    feature: 'cat__job_admin.',
    importance: 0.029977,
    label: 'Job: Admin',
    category: 'Customer Profile'
  },
  {
    feature: 'cat__job_retired',
    importance: 0.029288,
    label: 'Job: Retired',
    category: 'Customer Profile'
  }
];

export const ROC_CURVE_DATA = [
  { fpr: 0.000, tpr: 0.000, baseline: 0.000 },
  { fpr: 0.005, tpr: 0.195, baseline: 0.005 },
  { fpr: 0.012, tpr: 0.360, baseline: 0.012 },
  { fpr: 0.025, tpr: 0.520, baseline: 0.025 },
  { fpr: 0.040, tpr: 0.655, baseline: 0.040 },
  { fpr: 0.058, tpr: 0.735, baseline: 0.058 },
  { fpr: 0.0772, tpr: 0.7866, baseline: 0.0772, note: 'Decision Threshold (0.50)' },
  { fpr: 0.100, tpr: 0.835, baseline: 0.100 },
  { fpr: 0.140, tpr: 0.890, baseline: 0.140 },
  { fpr: 0.200, tpr: 0.935, baseline: 0.200 },
  { fpr: 0.300, tpr: 0.965, baseline: 0.300 },
  { fpr: 0.450, tpr: 0.985, baseline: 0.450 },
  { fpr: 0.650, tpr: 0.995, baseline: 0.650 },
  { fpr: 1.000, tpr: 1.000, baseline: 1.000 }
];

export const PROJECT_TEAM = [
  { name: 'Mrunal Warange', id: '24101C0007', role: 'Machine Learning & EDA' },
  { name: 'Vedant Chavan', id: '24101C0010', role: 'Data Preprocessing & SMOTE' },
  { name: 'Aryan Acharya', id: '24101C0022', role: 'Model Training & Evaluation' }
];

