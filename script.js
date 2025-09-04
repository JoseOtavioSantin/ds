class DashboardManager {
    constructor() {
        this.data = null;
        this.filteredData = null;
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botão de atualizar dados
        document.getElementById("refreshBtn").addEventListener("click", () => {
            this.refreshData();
        });

        // Botão de upload de arquivo
        document.getElementById("uploadBtn").addEventListener("click", () => {
            document.getElementById("fileInput").click();
        });

        // Input de arquivo
        document.getElementById("fileInput").addEventListener("change", (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Filtros
        document.getElementById("statusFilter").addEventListener("change", () => {
            this.applyFilters();
        });

        document.getElementById("departmentFilter").addEventListener("change", () => {
            this.applyFilters();
        });

        document.getElementById("performanceFilter").addEventListener("change", () => {
            this.applyFilters();
        });

        // Limpar filtros
        document.getElementById("clearFilters").addEventListener("click", () => {
            this.clearFilters();
        });

        // Modal
        document.getElementById("modalClose").addEventListener("click", () => {
            this.closeModal();
        });

        // Fechar modal clicando fora
        document.getElementById("detailModal").addEventListener("click", (e) => {
            if (e.target.id === "detailModal") {
                this.closeModal();
            }
        });
    }

    async loadInitialData() {
        try {
            const response = await fetch("processed_data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.filteredData = this.data.groups;
            this.updateDashboard();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            this.showNotification("Erro ao carregar dados iniciais. Verifique se \'processed_data.json\' existe.", "error");
        }
    }

    async refreshData() {
        const refreshBtn = document.getElementById("refreshBtn");
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = \'<div class="loading"></div> Atualizando...\';
        refreshBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.loadInitialData();
            
            this.showNotification("Dados atualizados com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao atualizar dados:", error);
            this.showNotification("Erro ao atualizar dados", "error");
        } finally {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }

    async handleFileUpload(file) {
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            this.showNotification("Por favor, selecione um arquivo Excel (.xlsx ou .xls)", "error");
            return;
        }

        const uploadBtn = document.getElementById("uploadBtn");
        const originalText = uploadBtn.innerHTML;
        
        uploadBtn.innerHTML = \'<div class="loading"></div> Processando...\';
        uploadBtn.disabled = true;

        try {
            // Em um ambiente real, você enviaria o arquivo para o servidor aqui
            // e o servidor processaria e retornaria o JSON atualizado.
            // Por enquanto, vamos simular o processamento e recarregar os dados existentes.
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification("Arquivo processado com sucesso! (Simulado)", "success");
            await this.loadInitialData(); // Recarrega os dados do processed_data.json
        } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            this.showNotification("Erro ao processar arquivo", "error");
        } finally {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
        }
    }

    updateDashboard() {
        this.updateRankingSection();
        this.updateFilters();
        this.updateIndicators();
    }

    updateRankingSection() {
        if (!this.data) return;

        document.getElementById("scoreValue").textContent = this.data.overall_score.toFixed(2);
        document.querySelector(".score-max").textContent = `/ ${this.data.overall_max_score.toFixed(2)}`;
        document.getElementById("percentageValue").textContent = `${this.data.overall_percentage.toFixed(2)}%`;
        document.getElementById("progressFill").style.width = `${this.data.overall_percentage}%`;
        
        const rankingBadge = document.getElementById("rankingBadge");
        rankingBadge.textContent = this.data.overall_rank;
        rankingBadge.className = `ranking-badge ${this.data.overall_rank}`;

        // Atualiza níveis ativos
        document.querySelectorAll(".level").forEach(level => {
            level.classList.remove("active");
        });
        
        const levels = document.querySelectorAll(".level");
        const rankIndex = ["BLUEBELT", "PREMIUM", "ADVANCED", "STANDARD"].indexOf(this.data.overall_rank);
        if (rankIndex !== -1 && levels[rankIndex]) {
            levels[rankIndex].classList.add("active");
        }
    }

    updateFilters() {
        if (!this.data) return;

        // Atualiza filtro de departamentos
        const departmentFilter = document.getElementById("departmentFilter");
        const departments = [...new Set(
            this.data.groups.flatMap(group => 
                group.indicators.flatMap(indicator => 
                    indicator.details.map(detail => detail.Departamento)
                )
            )
        )].filter(dept => dept).sort();

        departmentFilter.innerHTML = \'<option value="all">Todos</option>\';
        departments.forEach(dept => {
            const option = document.createElement("option");
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
    }

    updateIndicators() {
        if (!this.filteredData) return;

        const grid = document.getElementById("indicatorsGrid");
        const count = document.getElementById("indicatorsCount");
        
        count.textContent = this.filteredData.length;
        grid.innerHTML = \'\';

        this.filteredData.forEach((group, index) => {
            const card = this.createGroupCard(group, index);
            grid.appendChild(card);
        });
    }

    createGroupCard(group, index) {
        const card = document.createElement("div");
        card.className = "indicator-card"; // Reutilizando a classe para manter o estilo
        card.style.animationDelay = `${index * 0.1}s`;

        const percentage = group.percentage || 0;
        const progressClass = this.getProgressClass(percentage);
        
        // Determina o status do grupo (se tiver pelo menos um indicador ativo, o grupo é ativo)
        const hasActiveIndicator = group.indicators.some(indicator => 
            indicator.details.some(detail => detail.Status === "Ativo")
        );
        const status = hasActiveIndicator ? "ativo" : "inativo";
        
        // Pega o departamento mais comum dentro do grupo
        const departmentsInGroup = group.indicators.flatMap(indicator => 
            indicator.details.map(detail => detail.Departamento)
        ).filter(dept => dept);
        const mainDepartment = departmentsInGroup.length > 0 ? departmentsInGroup[0] : "N/A";

        card.innerHTML = `
            <div class="indicator-header">
                <div class="indicator-name">${group.name}</div>
                <div class="indicator-status ${status}">${status}</div>
            </div>
            <div class="indicator-score">
                <div class="score-current">${group.total_atingida.toFixed(2)}</div>
                <div class="score-total">/ ${group.total_maxima.toFixed(2)}</div>
            </div>
            <div class="indicator-progress">
                <div class="indicator-progress-bar">
                    <div class="indicator-progress-fill ${progressClass}" style="width: ${percentage}%"></div>
                </div>
                <div class="indicator-percentage">${percentage.toFixed(1)}%</div>
            </div>
            <div class="indicator-details">
                <div class="indicator-department">${mainDepartment}</div>
                <div class="indicator-items">${group.indicators.length} indicador(es)</div>
            </div>
        `;

        card.addEventListener("click", () => {
            this.showGroupDetails(group);
        });

        return card;
    }

    getProgressClass(percentage) {
        if (percentage === 0) return "progress-0";
        if (percentage <= 30) return "progress-low";
        if (percentage <= 70) return "progress-medium";
        if (percentage < 100) return "progress-high";
        return "progress-perfect";
    }

    showGroupDetails(group) {
        const modal = document.getElementById("detailModal");
        const title = document.getElementById("modalTitle");
        const body = document.getElementById("modalBody");

        title.textContent = `Detalhes do Grupo: ${group.name}`;
        
        body.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h4>Resumo Geral do Grupo</h4>
                <div class="detail-info">
                    <div class="detail-info-item">
                        <div class="detail-info-label">Pontuação Atingida</div>
                        <div class="detail-info-value">${group.total_atingida.toFixed(2)}</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="detail-info-label">Pontuação Máxima</div>
                        <div class="detail-info-value">${group.total_maxima.toFixed(2)}</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="detail-info-label">Percentual</div>
                        <div class="detail-info-value">${group.percentage.toFixed(2)}%</div>
                    </div>
                    <div class="detail-info-item">
                        <div class="detail-info-label">Total de Indicadores</div>
                        <div class="detail-info-value">${group.indicators.length}</div>
                    </div>
                </div>
            </div>
            <h4>Indicadores neste Grupo:</h4>
            <div class="indicator-list">
            ${group.indicators.map(indicator => `
                <div class="indicator-list-item">
                    <h5>${indicator.name}</h5>
                    <div class="indicator-list-details">
                        <span>Pontuação: ${indicator.total_atingida.toFixed(2)} / ${indicator.total_maxima.toFixed(2)}</span>
                        <span>Percentual: ${indicator.percentage.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-sub-details">
                        ${indicator.details.map(detail => {
                            const detailPercentage = (detail['Pontuação Atingida'] / detail['Pontuação Máxima'] * 100) || 0;
                            return `
                                <p>
                                    <strong>Sub-Grupo:</strong> ${detail['Sub-Grupo'] || 'N/A'} | 
                                    <strong>Departamento:</strong> ${detail.Departamento || 'N/A'} | 
                                    <strong>Status:</strong> ${detail.Status || 'N/A'} | 
                                    <strong>% Penetração:</strong> ${detailPercentage.toFixed(2)}% | 
                                    <strong>Pontuação:</strong> ${detail['Pontuação Atingida']?.toFixed(2) || '0.00'} / ${detail['Pontuação Máxima']?.toFixed(2) || '0.00'}
                                </p>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
            </div>
        `;

        modal.style.display = "block";
    }

    closeModal() {
        document.getElementById("detailModal").style.display = "none";
    }

    applyFilters() {
        if (!this.data) return;

        const statusFilter = document.getElementById("statusFilter").value;
        const departmentFilter = document.getElementById("departmentFilter").value;
        const performanceFilter = document.getElementById("performanceFilter").value;

        this.filteredData = this.data.groups.filter(group => {
            // Filtro de status: verifica se algum indicador dentro do grupo tem o status selecionado
            if (statusFilter !== "all") {
                const hasMatchingStatus = group.indicators.some(indicator => 
                    indicator.details.some(detail => 
                        detail.Status && detail.Status.toLowerCase() === statusFilter
                    )
                );
                if (!hasMatchingStatus) return false;
            }

            // Filtro de departamento: verifica se algum indicador dentro do grupo pertence ao departamento selecionado
            if (departmentFilter !== "all") {
                const hasMatchingDepartment = group.indicators.some(indicator => 
                    indicator.details.some(detail => 
                        detail.Departamento === departmentFilter
                    )
                );
                if (!hasMatchingDepartment) return false;
            }

            // Filtro de performance para o grupo
            if (performanceFilter !== "all") {
                const percentage = group.percentage || 0;
                switch (performanceFilter) {
                    case "zero":
                        if (percentage !== 0) return false;
                        break;
                    case "low":
                        if (percentage <= 0 || percentage > 30) return false;
                        break;
                    case "medium":
                        if (percentage <= 30 || percentage > 70) return false;
                        break;
                    case "high":
                        if (percentage <= 70 || percentage >= 100) return false;
                        break;
                    case "perfect":
                        if (percentage !== 100) return false;
                        break;
                }
            }

            return true;
        });

        this.updateIndicators();
    }

    clearFilters() {
        document.getElementById("statusFilter").value = "all";
        document.getElementById("departmentFilter").value = "all";
        document.getElementById("performanceFilter").value = "all";
        
        if (this.data) {
            this.filteredData = this.data.groups;
            this.updateIndicators();
        }
    }

    showNotification(message, type = "info") {
        // Cria elemento de notificação
        const notification = document.createElement("div");
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;

        switch (type) {
            case "success":
                notification.style.background = "linear-gradient(135deg, #48bb78, #38a169)";
                break;
            case "error":
                notification.style.background = "linear-gradient(135deg, #e53e3e, #c53030)";
                break;
            default:
                notification.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove após 3 segundos
        setTimeout(() => {
            notification.style.animation = "slideOutRight 0.3s ease";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Adiciona animações CSS para notificações
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializa o dashboard quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
    new DashboardManager();
});

