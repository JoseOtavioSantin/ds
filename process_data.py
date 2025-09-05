import json

def calculate_rank(score):
    if 900 <= score <= 1000:
        return "BLUEBELT"
    elif 800 <= score < 900:
        return "PREMIUM"
    elif 700 <= score < 800:
        return "ADVANCED"
    else:
        return "STANDARD"

def process_data(data):
    total_pontuacao_atingida = 0
    total_pontuacao_maxima = 0
    
    groups = {}

    for item in data:
        grupo = item.get("Grupo")
        indicador = item.get("Indicador")
        sub_grupo = item.get("Sub_Grupo") # Usar Sub_Grupo conforme renomeado no read_excel.py
        departamento = item.get("Departamento")
        sub_categoria = item.get("Sub_Categoria") # Usar Sub_Categoria conforme renomeado no read_excel.py
        status = item.get("Status")
        pontuacao_atingida = item.get("Pontuação_Atingida", 0.0) # Usar Pontuação_Atingida
        pontuacao_maxima = item.get("Pontuação_Máxima", 0.0) # Usar Pontuação_Máxima

        total_pontuacao_atingida += pontuacao_atingida
        total_pontuacao_maxima += pontuacao_maxima

        if grupo not in groups:
            groups[grupo] = {
                "total_atingida": 0.0,
                "total_maxima": 0.0,
                "indicators": {}
            }
        
        groups[grupo]["total_atingida"] += pontuacao_atingida
        groups[grupo]["total_maxima"] += pontuacao_maxima

        if indicador not in groups[grupo]["indicators"]:
            groups[grupo]["indicators"][indicador] = {
                "total_atingida": 0.0,
                "total_maxima": 0.0,
                "details": []
            }
        
        groups[grupo]["indicators"][indicador]["total_atingida"] += pontuacao_atingida
        groups[grupo]["indicators"][indicador]["total_maxima"] += pontuacao_maxima
        groups[grupo]["indicators"][indicador]["details"].append({
            "Grupo": grupo,
            "Sub-Grupo": sub_grupo,
            "Departamento": departamento,
            "Sub-Categoria": sub_categoria,
            "Status": status,
            "Pontuação Atingida": pontuacao_atingida,
            "Pontuação Máxima": pontuacao_maxima
        })

    overall_percentage = (total_pontuacao_atingida / total_pontuacao_maxima * 100) if total_pontuacao_maxima > 0 else 0
    overall_rank = calculate_rank(total_pontuacao_atingida)

    processed_groups = []
    for group_name, group_data in groups.items():
        group_percentage = (group_data["total_atingida"] / group_data["total_maxima"] * 100) if group_data["total_maxima"] > 0 else 0
        
        processed_indicators_in_group = []
        for ind_name, ind_data in group_data["indicators"].items():
            ind_percentage = (ind_data["total_atingida"] / ind_data["total_maxima"] * 100) if ind_data["total_maxima"] > 0 else 0
            processed_indicators_in_group.append({
                "name": ind_name,
                "total_atingida": ind_data["total_atingida"],
                "total_maxima": ind_data["total_maxima"],
                "percentage": round(ind_percentage, 2),
                "details": ind_data["details"]
            })

        processed_groups.append({
            "name": group_name,
            "total_atingida": group_data["total_atingida"],
            "total_maxima": group_data["total_maxima"],
            "percentage": round(group_percentage, 2),
            "indicators": processed_indicators_in_group
        })

    return {
        "overall_score": round(total_pontuacao_atingida, 2),
        "overall_max_score": round(total_pontuacao_maxima, 2),
        "overall_percentage": round(overall_percentage, 2),
        "overall_rank": overall_rank,
        "groups": processed_groups
    }

if __name__ == '__main__':
    with open('/home/ubuntu/data.json', 'r') as f:
        raw_data = json.load(f)
    
    processed_data = process_data(raw_data)

    with open('/home/ubuntu/processed_data.json', 'w') as f:
        json.dump(processed_data, f, indent=4)
    print('Dados processados e salvos em processed_data.json')


