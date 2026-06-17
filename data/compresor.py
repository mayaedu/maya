import json

# Archivos de entrada
DICTIONARY_FILE = "dictionary.json"
ADJECTIVES_FILE = "adjectives_extracted.txt"

# Archivo de salida
OUTPUT_FILE = "dictionary_updated.json"


def limpiar_palabra(palabra):
    """
    Limpia cada palabra:
    - quita espacios
    - convierte a minúscula
    - evita líneas vacías
    """
    return palabra.strip().lower()


# 1. Leer dictionary.json
with open(DICTIONARY_FILE, "r", encoding="utf-8") as file:
    dictionary = json.load(file)


# 2. Asegurar que exista la clave adjectives
if "adjectives" not in dictionary:
    dictionary["adjectives"] = []


# 3. Leer los adjetivos actuales del JSON
adjectives_actuales = set(
    limpiar_palabra(adj)
    for adj in dictionary["adjectives"]
    if limpiar_palabra(adj)
)


# 4. Leer los adjetivos del archivo TXT
with open(ADJECTIVES_FILE, "r", encoding="utf-8") as file:
    nuevos_adjetivos = set(
        limpiar_palabra(linea)
        for linea in file
        if limpiar_palabra(linea)
    )


# 5. Unir adjetivos sin duplicados
adjectives_finales = sorted(adjectives_actuales.union(nuevos_adjetivos))


# 6. Actualizar el JSON
dictionary["adjectives"] = adjectives_finales


# 7. Guardar nuevo archivo JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(dictionary, file, ensure_ascii=False, indent=2)


print("Proceso completado.")
print(f"Adjetivos anteriores: {len(adjectives_actuales)}")
print(f"Adjetivos nuevos encontrados en TXT: {len(nuevos_adjetivos)}")
print(f"Total final en adjectives: {len(adjectives_finales)}")
print(f"Archivo generado: {OUTPUT_FILE}")