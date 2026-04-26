import pandas as pd
file_path = r"c:\Bun\KLTN_final\KLTN\Database\listen_data\Dapan_Listenning.xlsx"
df = pd.read_excel(file_path)
print("Columns:", df.columns.tolist())
print(df.head(2).to_dict(orient='records'))
