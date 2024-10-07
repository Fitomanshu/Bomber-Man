import os

def listar_archivos_como_arbol(ruta_carpeta, archivo_salida, archivos_encontrados, prefijo=""):
    """
    Lista todos los archivos y carpetas en un directorio dado y sus subdirectorios en forma de árbol,
    omitiendo las carpetas "Lib", "node_modules", y ".git".
    """
    carpetas_omitidas = [".git", "Lib", "node_modules"]
    carpetas_permitidas_node_modules = []

    archivos_a_buscar = [
        "cornerstone.min.js", "cornerstoneWADOImageLoader.min.js",
        "dicomParser.min.js", "cornerstoneTools.min.js"
    ]

    for elemento in os.listdir(ruta_carpeta):
        ruta_completa = os.path.join(ruta_carpeta, elemento)
        if os.path.isdir(ruta_completa):
            if elemento in carpetas_omitidas:
                archivo_salida.write(prefijo + f"└── Carpeta '{elemento}' (omitida)\n")
            elif elemento == "node_modules":
                archivo_salida.write(prefijo + "└── " + elemento + "\n")
                for sub_elemento in os.listdir(ruta_completa):
                    if sub_elemento in carpetas_permitidas_node_modules:
                        sub_ruta_completa = os.path.join(ruta_completa, sub_elemento)
                        archivo_salida.write(prefijo + "    └── " + sub_elemento + "\n")
                        listar_archivos_como_arbol(sub_ruta_completa, archivo_salida, archivos_encontrados, prefijo + "        ")
            else:
                archivo_salida.write(prefijo + "└── " + elemento + "\n")
                listar_archivos_como_arbol(ruta_completa, archivo_salida, archivos_encontrados, prefijo + "    ")
        else:
            if elemento in archivos_a_buscar:
                archivo_salida.write(prefijo + "└── " + elemento + " (¡Encontrado!)\n")
                archivos_encontrados.append(ruta_completa)
            else:
                archivo_salida.write(prefijo + "└── " + elemento + "\n")

if __name__ == "__main__":
    ruta_carpeta = input("Ingresa la ruta de la carpeta: ")
    archivo_salida_path = "salida_arbol.txt"
    archivos_encontrados = []

    # Abre el archivo en modo escritura con codificación UTF-8
    with open(archivo_salida_path, "w", encoding="utf-8") as archivo_salida:
        listar_archivos_como_arbol(ruta_carpeta, archivo_salida, archivos_encontrados)
        
        # Imprimir las rutas de los archivos encontrados al final del archivo
        if archivos_encontrados:
            archivo_salida.write("\nArchivos específicos encontrados:\n")
            for archivo in archivos_encontrados:
                archivo_salida.write(f"{archivo}\n")
        else:
            archivo_salida.write("\nNo se encontraron los archivos específicos.\n")
    
    print(f"El árbol de archivos y las rutas de los archivos encontrados han sido guardados en '{archivo_salida_path}'.")
