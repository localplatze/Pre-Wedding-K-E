document.addEventListener('DOMContentLoaded', () => {
    const guestNameInput = document.getElementById('guest-name-input');
    const addGuestBtn = document.getElementById('add-guest-btn');
    const guestListBody = document.getElementById('guest-list-body');
    const noGuestsMessage = document.getElementById('no-guests-message');
    const guestCountSpan = document.getElementById('guest-count');
    const filterResponseSelect = document.getElementById('filter-response');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const importLabel = document.querySelector('.import-label-btn');

    const STORAGE_KEY = 'weddingGuestsList';

    // --- Data Management ---
    let guests = [];

    function loadGuests() {
        const storedGuests = localStorage.getItem(STORAGE_KEY);
        if (storedGuests) {
            try {
                guests = JSON.parse(storedGuests);
                 if (!Array.isArray(guests)) { // Validação básica
                     console.warn("Dado inválido no localStorage, resetando para lista vazia.");
                     guests = [];
                 }
            } catch (e) {
                 console.error("Erro ao parsear dados do localStorage:", e);
                 guests = []; // Reseta em caso de erro
            }
    
        } else {
            guests = []; // Initialize if nothing is stored
        }
        renderGuestList(); // Initial render after loading
    }

    function saveGuests() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
        renderGuestList(); // Re-render to reflect saved state and filters
    }

    // --- Guest Operations ---
    function addGuest() {
        const name = guestNameInput.value.trim();
        if (name === '') {
            alert('Por favor, insira o nome do convidado.');
            return;
        }

        const newGuest = {
            id: Date.now(), // Simple unique ID using timestamp
            name: name,
            sent: false, // Convite enviado? (default: não)
            response: 'Não Respondido' // Resposta (default: Não Respondido)
        };

        guests.push(newGuest);
        guestNameInput.value = ''; // Clear input field
        saveGuests(); // Save and re-render
    }

    function updateGuest(id, field, value) {
        const guestIndex = guests.findIndex(guest => guest.id === id);
        if (guestIndex > -1) {
            guests[guestIndex][field] = value;
            saveGuests(); // Save and re-render
        }
    }

    function deleteGuest(id) {
        if (confirm('Tem certeza que deseja remover este convidado?')) {
            guests = guests.filter(guest => guest.id !== id);
            saveGuests(); // Save and re-render
        }
    }

    // --- Rendering ---
    function renderGuestList() {
        guestListBody.innerHTML = ''; // Clear current list

        const filterValue = filterResponseSelect.value;
        const filteredGuests = guests.filter(guest => {
            if (filterValue === 'all') return true;
            return guest.response === filterValue;
        });

        if (filteredGuests.length === 0) {
            noGuestsMessage.classList.remove('hidden');
             guestListBody.innerHTML = ''; // Ensure table body is empty
        } else {
            noGuestsMessage.classList.add('hidden');
            filteredGuests.forEach(guest => {
                const row = document.createElement('tr');
                row.dataset.id = guest.id; // Store ID on the row

                // Name Cell
                const nameCell = document.createElement('td');
                nameCell.textContent = guest.name;
                row.appendChild(nameCell);

                // Sent Cell (Checkbox)
                const sentCell = document.createElement('td');
                const sentCheckbox = document.createElement('input');
                sentCheckbox.type = 'checkbox';
                sentCheckbox.checked = guest.sent;
                sentCheckbox.addEventListener('change', (e) => {
                    updateGuest(guest.id, 'sent', e.target.checked);
                });
                sentCell.appendChild(sentCheckbox);
                row.appendChild(sentCell);

                // Response Cell (Dropdown)
                const responseCell = document.createElement('td');
                responseCell.classList.add('response-cell'); // For potential specific styling
                const responseSelect = document.createElement('select');
                const responses = ['Não Respondido', 'Sim', 'Não', 'Talvez'];
                responses.forEach(resp => {
                    const option = document.createElement('option');
                    option.value = resp;
                    option.textContent = resp;
                    if (guest.response === resp) {
                        option.selected = true;
                    }
                    responseSelect.appendChild(option);
                });
                responseSelect.addEventListener('change', (e) => {
                     updateGuest(guest.id, 'response', e.target.value);
                     // Optionally update status class immediately for visual feedback
                     updateResponseCellStyle(responseCell.querySelector('span'), e.target.value);
                });

                 // Add a span inside the cell for styled text (optional but nice)
                const responseSpan = document.createElement('span');
                updateResponseCellStyle(responseSpan, guest.response); // Set initial style
                responseCell.appendChild(responseSelect); // Add dropdown first
                //responseCell.appendChild(responseSpan); // Add styled span if desired (commented out for now)
                row.appendChild(responseCell);


                // Action Cell (Delete Button)
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Remover';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => {
                    deleteGuest(guest.id);
                });
                actionCell.appendChild(deleteButton);
                row.appendChild(actionCell);

                guestListBody.appendChild(row);
            });
        }
         // Update guest count display
        guestCountSpan.textContent = `Total: ${guests.length} (${filteredGuests.length} exibidos)`;
    }

     // Helper function to apply CSS classes based on response status
    function updateResponseCellStyle(element, response) {
        // Remove existing status classes first
        element.className = ''; // Clear classes if it's a span
         let cell = element;
         // If we pass the cell (td) instead of a span, find the select's parent td
         if(element.tagName !== 'SPAN') {
            cell = element.closest('td');
            if(!cell) return; // Safety check
         }

         cell.classList.remove('status-sim', 'status-nao', 'status-talvez', 'status-nao-respondido');

        // Add the appropriate class
        switch (response) {
            case 'Sim':
                cell.classList.add('status-sim');
                // element.textContent = 'Sim'; // Update span text if using span
                break;
            case 'Não':
                 cell.classList.add('status-nao');
                // element.textContent = 'Não';
                break;
            case 'Talvez':
                 cell.classList.add('status-talvez');
                // element.textContent = 'Talvez';
                break;
            case 'Não Respondido':
            default:
                 cell.classList.add('status-nao-respondido');
                // element.textContent = 'Não Respondido';
                break;
        }
    }


    // --- Event Listeners ---
    addGuestBtn.addEventListener('click', addGuest);

    // Allow adding guest by pressing Enter in the input field
    guestNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addGuest();
        }
    });

    filterResponseSelect.addEventListener('change', renderGuestList); // Re-render when filter changes

    clearFiltersBtn.addEventListener('click', () => {
        filterResponseSelect.value = 'all'; // Reset dropdown
        renderGuestList(); // Re-render with all guests
    });

    function exportData() {
        if (guests.length === 0) {
            alert("A lista está vazia, nada para exportar.");
            return;
        }
        const dataStr = JSON.stringify(guests, null, 2); // null, 2 para formatar o JSON
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
    
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        link.download = `convidados-casamento-${timestamp}.json`; // Nome do arquivo
        document.body.appendChild(link); // Necessário para Firefox
        link.click();
    
        // Limpeza
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    
        alert("Arquivo JSON gerado para download!");
    }
    
    function importData(event) {
        const file = event.target.files[0];
        if (!file) {
            return; // Nenhum arquivo selecionado
        }
    
        if (file.type !== 'application/json') {
            alert("Por favor, selecione um arquivo .json válido.");
            // Limpa o input para permitir selecionar o mesmo arquivo novamente se houver erro
            event.target.value = null;
            return;
        }
    
        const reader = new FileReader();
    
        reader.onload = (e) => {
            try {
                const importedGuests = JSON.parse(e.target.result);
                // Validação básica (verifica se é um array)
                if (!Array.isArray(importedGuests)) {
                    throw new Error("O arquivo JSON não contém uma lista válida.");
                }
                // Validação opcional mais profunda (verificar se os objetos têm as propriedades esperadas)
                // ... (pode ser adicionado se necessário)
    
                if (confirm(`Importar ${importedGuests.length} convidados deste arquivo? A lista atual será substituída.`)) {
                    guests = importedGuests; // Substitui a lista atual
                    saveGuests(); // Salva no localStorage E RENDERIZA a nova lista
                    alert("Lista importada com sucesso!");
                }
            } catch (error) {
                alert(`Erro ao importar o arquivo: ${error.message}`);
                console.error("Erro ao parsear JSON:", error);
            } finally {
                 // Limpa o input para permitir selecionar o mesmo arquivo novamente
                 event.target.value = null;
            }
        };
    
        reader.onerror = () => {
            alert("Erro ao ler o arquivo.");
             event.target.value = null;
        };
    
        reader.readAsText(file);
    }
    
    
    // --- Event Listeners para Exportar/Importar ---
    exportBtn.addEventListener('click', exportData);
    
    // Aciona o input de arquivo quando o label (que parece botão) é clicado
    importLabel.addEventListener('click', () => importFile.click());
    // Escuta por mudanças no input de arquivo (quando um arquivo é selecionado)
    importFile.addEventListener('change', importData);
    
    
    // --- Modificação na Função saveGuests ---
    // A função saveGuests agora continua salvando no localStorage,
    // mas você tem a opção de exportar para um arquivo quando quiser.
    // Se você quiser *apenas* usar arquivos, pode remover as chamadas a saveGuests
    // e confiar *apenas* nos botões de exportar/importar, mas perderá a persistência
    // automática entre as sessões sem salvar/carregar manualmente. Manter ambos
    // (localStorage + export/import) oferece o melhor dos dois mundos: conveniência e backup.
    
    function saveGuests() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(guests)); // Continua salvando no localStorage
        renderGuestList(); // Re-renderiza
    }

    // --- Initial Load ---
    loadGuests();
});