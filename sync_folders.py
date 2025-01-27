import os
import shutil
import argparse

def sync_folders(source_dir, target_dir):
    """
    İki klasör arasında senkronizasyon yapar, node_modules hariç
    """
    # node_modules klasörünü atlayacağız
    ignore_patterns = ['node_modules']
    
    # Hedef klasördeki tüm dosyaları kontrol et ve sil (node_modules hariç)
    for root, dirs, files in os.walk(target_dir, topdown=True):
        dirs[:] = [d for d in dirs if d not in ignore_patterns]
        
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, target_dir)
            source_path = os.path.join(source_dir, rel_path)
            
            # Eğer kaynak dosya artık yoksa, hedef dosyayı sil
            if not os.path.exists(source_path):
                os.remove(file_path)
                print(f"Silindi: {rel_path}")
    
    # Kaynak klasördeki dosyaları kopyala
    for root, dirs, files in os.walk(source_dir, topdown=True):
        dirs[:] = [d for d in dirs if d not in ignore_patterns]
        
        for file in files:
            source_path = os.path.join(root, file)
            rel_path = os.path.relpath(source_path, source_dir)
            target_path = os.path.join(target_dir, rel_path)
            
            # Hedef klasörü oluştur (gerekirse)
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            # Dosyayı kopyala
            shutil.copy2(source_path, target_path)
            print(f"Kopyalandı: {rel_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Klasörler arası senkronizasyon (node_modules hariç)")
    parser.add_argument("source", help="Kaynak klasör yolu")
    parser.add_argument("target", help="Hedef klasör yolu")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.source):
        print("Hata: Kaynak klasör bulunamadı!")
        exit(1)
    
    if not os.path.exists(args.target):
        print("Hata: Hedef klasör bulunamadı!")
        exit(1)
    
    sync_folders(args.source, args.target) 