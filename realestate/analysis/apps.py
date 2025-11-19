from django.apps import AppConfig
import pandas as pd
import os


class AnalysisConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analysis'
    excel_data = None
    def ready(self):
        # Loading Excel file when Engine gets ready.
        # Loading Excel file ONCE to optimize performance.
        excel_path = os.path.join(os.path.dirname(__file__), "data.xlsx")
        print("Loading Excel file:", excel_path)
        AnalysisConfig.excel_data = pd.read_excel(excel_path)
        print("Excel loaded successfully")