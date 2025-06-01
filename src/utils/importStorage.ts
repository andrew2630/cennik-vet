export function importAllDataFromJSON(file: File, onFinish: () => void) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string);
      if (data.products) localStorage.setItem('vet_products', JSON.stringify(data.products));
      if (data.clients) localStorage.setItem('vet_clients', JSON.stringify(data.clients));
      if (data.transactions) localStorage.setItem('vet_transactions', JSON.stringify(data.transactions));
      if (data.settings) localStorage.setItem('vet_settings', JSON.stringify(data.settings));
      onFinish();
    } catch {
      alert('Nieprawidłowy plik JSON');
    }
  };
  reader.readAsText(file);
}
