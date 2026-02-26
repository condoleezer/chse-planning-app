import pandas as pd
import json
from pymongo import MongoClient
import os
from datetime import datetime


def extract_agent_name(file_path, sheet_name='Planning codes'):
    """Extract agent name from the first row of the Excel file"""
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=None, nrows=3)
    
    # Check first 3 rows for planning information
    for row_idx in range(3):
        row_values = df.iloc[row_idx].dropna().astype(str).tolist()
        
        for cell in row_values:
            if 'Planning' in cell and 'de' in cell:
                # Extract name between 'de' and 'Edité'
                start = cell.find('de') + 3
                end = cell.find('Edité')
                if end != -1:
                    return cell[start:end].strip()
                else:
                    # Try to extract until end of string
                    name = cell[start:].strip()
                    if name:
                        return name
    
    return "Unknown"


def extract_annual_planning(file_path, user_name=None):
    """Extract annual planning data from CHSE_agent annuel.xlsx"""
    # Use provided user_name or extract from file
    if not user_name:
        user_name = extract_agent_name(file_path)
    
    # Read the planning codes sheet - read raw data first
    df = pd.read_excel(file_path, sheet_name='Planning codes', header=None)
    
    # Replace NaN with empty string
    df = df.fillna('')
    
    # Structure: months are in columns, days are in rows
    planning_data = {
        'name': user_name,
        'type': 'annual',
        'year': 2026,
        'data': {}
    }
    
    # Get month columns (every 3 columns starting from column 1)
    months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    
    # Extract data for each month (starting from row 2, column 1)
    for i, month in enumerate(months):
        month_col_start = 1 + (i * 3)  # Each month has 3 columns
        if month_col_start + 1 < len(df.columns):
            planning_data['data'][month] = {}
            
            # Extract day by day data (starting from row 2)
            for row_idx in range(2, min(len(df), 35)):  # Max 31 days + some buffer
                try:
                    day_col = df.iloc[row_idx, month_col_start]
                    code_col = df.iloc[row_idx, month_col_start + 1]
                    
                    day_str = str(day_col).strip()
                    code_str = str(code_col).strip()
                    
                    # Check if we have valid day data
                    if day_str and day_str not in ['', 'nan', 'NaN']:
                        planning_data['data'][month][str(row_idx - 1)] = {
                            'day': day_str,
                            'code': code_str if code_str not in ['', 'nan', 'NaN'] else ''
                        }
                except Exception as e:
                    continue
    
    return planning_data


def extract_monthly_planning(file_path, cadre_name=None):
    """Extract monthly planning data from CHSE_Cadre mensuel.xlsx"""
    # For monthly planning, extract the service/department name or use "Collectif"
    df_header = pd.read_excel(file_path, sheet_name='Planning codes', header=None, nrows=3)
    
    month_name = "février"
    year = 2026
    
    # Use provided cadre_name or extract from file
    if not cadre_name:
        cadre_name = "Planning Collectif"
        
        # Try to extract month and year from header
        for row_idx in range(3):
            row_values = df_header.iloc[row_idx].dropna().astype(str).tolist()
            for cell in row_values:
                if 'Planning collectif' in cell:
                    # Extract date range if present
                    if 'du' in cell and 'au' in cell:
                        # Could parse dates here if needed
                        pass
                if 'Par' in cell:
                    # Extract cadre name after "Par"
                    start = cell.find('Par') + 4
                    name = cell[start:].strip()
                    if name and name != 'nan':
                        cadre_name = name
    
    # Read the planning codes sheet - read raw data
    df = pd.read_excel(file_path, sheet_name='Planning codes', header=None)
    
    # Replace NaN with empty string
    df = df.fillna('')
    
    # Structure for monthly planning
    planning_data = {
        'name': cadre_name,
        'type': 'monthly',
        'month': month_name,
        'year': year,
        'data': []
    }
    
    # Extract each employee's planning (starting from row 3)
    for row_idx in range(3, len(df)):
        employee_name = str(df.iloc[row_idx, 0]).strip()
        
        # Skip empty rows and total rows
        if not employee_name or employee_name.lower() in ['total', 'nan', '']:
            continue
        
        employee_data = {
            'employee': employee_name,
            'days': {}
        }
        
        # Extract daily codes (columns after employee name)
        for col_idx in range(1, min(len(df.columns), 32)):  # Max 31 days
            value = str(df.iloc[row_idx, col_idx]).strip()
            
            if value and value not in ['', 'nan', 'NaN']:
                day_num = col_idx
                employee_data['days'][str(day_num)] = value
        
        if employee_data['days']:
            planning_data['data'].append(employee_data)
    
    return planning_data


def extract_code_meanings(file_path):
    """Extract code meanings from 'Détail codes' sheet"""
    try:
        df = pd.read_excel(file_path, sheet_name='Détail codes')
        df = df.fillna('')
        
        codes = []
        for idx, row in df.iterrows():
            if len(row) >= 2:
                code = str(row.iloc[0]).strip()
                meaning = str(row.iloc[1]).strip()
                
                if code and code != 'nan' and meaning and meaning != 'nan':
                    codes.append({
                        'code': code,
                        'meaning': meaning
                    })
        
        return codes
    except Exception as e:
        print(f"Error extracting code meanings: {e}")
        return []


def store_in_mongodb(planning_data, codes_data, collection_name):
    """Store planning data in MongoDB"""
    # Get MongoDB connection from environment or use default
    MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGO_DB = os.getenv("MONGO_DB", "planRH")
    
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    
    # Store planning data
    collection = db[collection_name]
    
    # Check if planning already exists for this agent
    existing = collection.find_one({'name': planning_data['name'], 'type': planning_data['type']})
    
    if existing:
        # Update existing planning
        collection.update_one(
            {'_id': existing['_id']},
            {'$set': planning_data}
        )
        print(f"Updated planning for {planning_data['name']}")
    else:
        # Insert new planning
        result = collection.insert_one(planning_data)
        print(f"Inserted planning for {planning_data['name']}, ID: {result.inserted_id}")
    
    # Store code meanings if provided
    if codes_data:
        codes_collection = db['code_meanings']
        for code in codes_data:
            existing_code = codes_collection.find_one({'code': code['code']})
            if not existing_code:
                codes_collection.insert_one(code)
        print(f"Stored {len(codes_data)} code meanings")
    
    client.close()


def get_users_from_db():
    """Get all users from MongoDB database grouped by role"""
    MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGO_DB = os.getenv("MONGO_DB", "planRH")
    
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    users = db["users"]
    
    # Get all nurses and cadres
    nurses = list(users.find({"role": "nurse"}))
    cadres = list(users.find({"role": "cadre"}))
    
    client.close()
    
    return nurses, cadres


def main():
    """Main execution function"""
    # File paths
    annual_file = 'CHSE_agent annuel.xlsx'
    monthly_file = 'CHSE_Cadre mensuel.xlsx'
    
    print("=" * 50)
    print("Extraction des plannings CHSE")
    print("=" * 50)
    
    # Get users from database
    print("\n🔍 Récupération des utilisateurs depuis la BD...")
    nurses, cadres = get_users_from_db()
    
    print(f"   Agents de santé trouvés: {len(nurses)}")
    print(f"   Cadres trouvés: {len(cadres)}")
    
    # Extract annual planning template (for all nurses)
    if os.path.exists(annual_file) and nurses:
        print(f"\n📅 Extraction du planning annuel: {annual_file}")
        codes_annual = extract_code_meanings(annual_file)
        
        # Create planning for each nurse
        for nurse in nurses:
            nurse_name = f"{nurse.get('first_name', '')} {nurse.get('last_name', '')}".strip()
            print(f"   → Création du planning pour: {nurse_name}")
            
            annual_planning = extract_annual_planning(annual_file, nurse_name)
            store_in_mongodb(annual_planning, codes_annual if nurse == nurses[0] else [], 'annual_programs')
        
        print(f"   ✅ {len(nurses)} plannings annuels créés dans MongoDB")
    elif not os.path.exists(annual_file):
        print(f"❌ Fichier non trouvé: {annual_file}")
    else:
        print(f"❌ Aucun agent de santé disponible")
    
    # Extract monthly planning template (for all cadres)
    if os.path.exists(monthly_file) and cadres:
        print(f"\n📅 Extraction du planning mensuel: {monthly_file}")
        codes_monthly = extract_code_meanings(monthly_file)
        
        # Create planning for each cadre
        for cadre in cadres:
            cadre_name = f"{cadre.get('first_name', '')} {cadre.get('last_name', '')}".strip()
            print(f"   → Création du planning pour: {cadre_name}")
            
            monthly_planning = extract_monthly_planning(monthly_file, cadre_name)
            store_in_mongodb(monthly_planning, codes_monthly if cadre == cadres[0] else [], 'monthly_programs')
        
        print(f"   ✅ {len(cadres)} plannings mensuels créés dans MongoDB")
    elif not os.path.exists(monthly_file):
        print(f"❌ Fichier non trouvé: {monthly_file}")
    else:
        print(f"❌ Aucun cadre disponible")
    
    print("\n" + "=" * 50)
    print("✅ Extraction terminée avec succès!")
    print("=" * 50)


if __name__ == "__main__":
    main()
