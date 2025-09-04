import pandas as pd

def read_excel_to_json(file_path):
    df = pd.read_excel(file_path)
    return df.to_json(orient='records', indent=4)

if __name__ == '__main__':
    excel_file = '/home/ubuntu/upload/Pasta1.xlsx'
    json_data = read_excel_to_json(excel_file)
    with open('/home/ubuntu/data.json', 'w') as f:
        f.write(json_data)
    print('Dados da planilha convertidos para data.json')

