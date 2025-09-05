import pandas as pd
import json

def excel_to_json(excel_path, json_path):
    df = pd.read_excel(excel_path)
    
    # Renomear colunas para padronização, se necessário
    df.columns = df.columns.str.strip().str.replace(" ", "_").str.replace("-", "_").str.replace("%", "Percentual_").str.replace("(", "").str.replace(")", "")

    # Certificar-se de que as colunas essenciais existem
    required_columns = [
        "Grupo",
        "Indicador",
        "Sub_Grupo",
        "Departamento",
        "Status",
        "Pontuação_Atingida",
        "Pontuação_Máxima",
        "Sub_Categoria" # Adicionando a nova coluna
    ]

    for col in required_columns:
        if col not in df.columns:
            df[col] = None # Adiciona a coluna com valores nulos se não existir

    # Converter para JSON
    df.to_json(json_path, orient="records", indent=4)

if __name__ == "__main__":
    excel_file = "/home/ubuntu/upload/Pasta1.xlsx"
    json_file = "/home/ubuntu/data.json"
    excel_to_json(excel_file, json_file)
    print(f"Dados da planilha \'{excel_file}\' convertidos para \'{json_file}\'")

