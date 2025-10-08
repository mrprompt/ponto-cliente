/**
 * Ponto
 *
 * Sistema de ponto
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @author     Thiago Paes - mrprompt@gmail.com
 * @package    Ponto
 * @subpackage Ponto
 * @filesource Ponto.js
 * @copyright  Copyright 2011, Thiago Paes
 * @link       http://github.com/mrprompt/ponto/
 * @version    $Revision: 0.3 $
 * @license    http://www.opensource.org/licenses/mit-license.php The MIT License
 */

// Helper functions for localStorage
const LS_KEYS = {
    USERS: 'ponto_users',
    RECORDS: 'ponto_records',
    NEXT_USER_ID: 'ponto_nextUserId',
    NEXT_RECORD_ID: 'ponto_nextRecordId'
};

function getFromLS(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return defaultValue;
    }
}

function saveToLS(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateUniqueId(key) {
    let currentId = parseInt(localStorage.getItem(key) || '1', 10);
    localStorage.setItem(key, (currentId + 1).toString());
    return currentId.toString();
}

// Function to hash passwords using SHA-256
function hashPassword(password) {
    // Ensure sha256 is available globally from the CDN script
    if (typeof sha256 === 'function') {
        return sha256(password);
    } else {
        console.error('SHA-256 library not loaded. Passwords will not be hashed.');
        return password; // Fallback to plain text if hashing library is not available
    }
}

// Initial data setup if localStorage is empty
function setupInitialData() {
    if (!localStorage.getItem(LS_KEYS.USERS)) {
        const initialUser = {
            id: '1',
            nome: 'Admin',
            login: 'admin',
            email: 'admin@example.com',
            senha: hashPassword('admin'), // Hash initial admin password
            horas_dia: '8',
            horas_almoco: '1',
            dias_trabalho: '1,2,3,4,5',
            owner: null
        };
        saveToLS(LS_KEYS.USERS, [initialUser]);
        localStorage.setItem(LS_KEYS.NEXT_USER_ID, '2');
    }

    if (!localStorage.getItem(LS_KEYS.RECORDS)) {
        saveToLS(LS_KEYS.RECORDS, []);
        localStorage.setItem(LS_KEYS.NEXT_RECORD_ID, '1');
    }
}

var Ponto = {
    /**
     * Cria o ambiente
     */
    init: function(apiServer) {
        // Setup initial data if not present
        setupInitialData();

        $('body > #container').empty();

        $('<section/>').attr('id', 'Ponto').appendTo($('#container'));

        if (localStorage.getItem('id') !== null) {
            $('#login-form').dialog('close');
            $('#login-form').remove();

            const header = $('<header/>'); // Changed var to const
            const menu = $('<ul/>'); // Changed var to const

            header
                .append($('<span/>')
                        .html('Logado como: ')
                        .append($('<b/>').html(localStorage.getItem('nome')))
                )
                .append($('<nav/>')
                    .append(
                        menu
                        .append($('<li/>')
                            .append($('<a/>')
                                .html('+')
                                .attr('href', 'javascript:;')
                                .button()
                                .click(function() {
                                    Ponto.ponto();
                                })
                            )
                        )
                        .append($('<li/>')
                            .append($('<a/>')
                                .html('Preferências')
                                .attr('href', 'javascript:;')
                                .button()
                                .click(function() {
                                    Ponto.preferencias();
                                })
                            )
                        )
                    )
                )
                .insertBefore($('#Ponto'));

            if (localStorage.getItem('owner') == 'null') { // Check if current user is an owner (owner is null for top-level admin)
                menu
                    .append($('<li/>')
                        .append($('<a/>')
                            .html('Usuários')
                            .attr('href', 'javascript:;')
                            .button()
                            .click(function() {
                                Ponto.usuarios();
                            })
                        )
                    )
            }

            menu.append($('<li/>')
                .append($('<a/>')
                    .html('Sair')
                    .attr('href', 'javascript:;')
                    .button()
                    .click(function() {
                        Ponto.logout();
                    })
                )
            );

            // escondo o botão de ponto caso hoje não seja um dia de trabalho
            // setado nas configurações do usuário
            const arrDiasTrabalho = localStorage.getItem('dias_trabalho').split(','); // Changed var to const
            const objData = new Date(); // Changed var to const

            if ($.inArray(objData.getDay().toString(), arrDiasTrabalho) < 0) {
                $('header nav ul li:eq(0)').hide();
            }

            Ponto.relatorio();
        } else {
            Ponto.login();
        }
    },

    /**
     * Cria o formulário de login
     */
    _formLogin: function() {
        const $fieldset = $('<fieldset/>') // Changed var to const
            .append($('<label/>')
                .attr('for', 'usuario')
                .html('Usuário')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'usuario')
                    .attr('id', 'usuario')
                    .addClass('text ui-widget-content ui-corner-all')))
            .append($('<label/>')
                .attr('for', 'senha')
                .html('Senha')
                .append($('<input/>')
                    .attr('type', 'password')
                    .attr('name', 'senha')
                    .attr('id', 'senha')
                    .addClass('text ui-widget-content ui-corner-all')));

        return $('<form/>').append($fieldset);
    },

    /**
     * Formulário de cadastro de usuário
     */
    _formCadastro: function() {
        const $fieldset = $('<fieldset/>') // Changed var to const
            .append($('<label/>')
                .attr('for', 'Nome')
                .html('Nome')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'nome')
                    .attr('id', 'nome')
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<label/>')
                .attr('for', 'usuario')
                .html('Login')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'usuario')
                    .attr('id', 'usuario')
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<label/>')
                .attr('for', 'email')
                .html('E-mail')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'email')
                    .attr('id', 'email')
                    .addClass('text ui-widget-content ui-corner-all required email')))
            .append($('<label/>')
                .attr('for', 'senha')
                .html('Senha')
                .append($('<input/>')
                    .attr('type', 'password')
                    .attr('name', 'senha')
                    .attr('id', 'senha')
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<label/>')
                .attr('for', 'senha_confirmacao')
                .html('Repita')
                .append($('<input/>')
                    .attr('type', 'password')
                    .attr('name', 'senha_confirmacao')
                    .attr('id', 'senha_confirmacao')
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<label/>')
                .attr('for', 'horas_dia')
                .html('Carga horária')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'horas_dia')
                    .attr('id', 'horas_dia')
                    .attr('maxlength', '2')
                    .mask('9?9', {
                        placeholder: " "
                    })
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<label/>')
                .attr('for', 'horas_almoco')
                .html('Intervalo')
                .append($('<input/>')
                    .attr('type', 'text')
                    .attr('name', 'horas_almoco')
                    .attr('id', 'horas_almoco')
                    .attr('maxlength', '2')
                    .mask('9?9', {
                        placeholder: " "
                    })
                    .addClass('text ui-widget-content ui-corner-all required')))
            .append($('<fieldset/>')
                .append($('<legend/>')
                    .html('Dias de Trabalho'))
                .addClass('diasTrabalho')
                .append($('<label/>')
                    .html('Dom')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_0')
                        .val('0')))
                .append($('<label/>')
                    .html('Seg')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_1')
                        .attr('checked', true)
                        .val('1')))
                .append($('<label/>')
                    .html('Ter')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_2')
                        .attr('checked', true)
                        .val('2')))
                .append($('<label/>')
                    .html('Qua')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_3')
                        .attr('checked', true)
                        .val('3')))
                .append($('<label/>')
                    .html('Qui')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_4')
                        .attr('checked', true)
                        .val('4')))
                .append($('<label/>')
                    .html('Sex')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_5')
                        .attr('checked', true)
                        .val('5')))
                .append($('<label/>')
                    .html('Sáb')
                    .append($('<input/>')
                        .attr('type', 'checkbox')
                        .attr('name', 'dias_trabalho[]')
                        .attr('id', 'dias_trabalho_6')
                        .val('6'))))
            .append($('<input/>')
                .attr('type', 'hidden')
                .attr('name', 'owner')
                .attr('id', 'owner'))
            .append($('<input/>')
                .attr('type', 'hidden')
                .attr('name', 'id')
                .attr('id', 'id'));

        const $form = $('<form/>') // Changed var to const
            .attr('id', 'frmCadastro')
            .append($fieldset);

        return $form;
    },

    /**
     * Formulário de inserção de hora-ponto
     */
    _formPonto: function() {
        const $fieldset = $('<fieldset/>') // Changed var to const
            .append($('<label/>')
                .attr('for', 'observacao')
                .html('Observação')
                .append($('<textarea/>')
                    .attr('name', 'observacao')
                    .attr('id', 'observacao')
                    .addClass('text ui-widget-content ui-corner-all')));

        return $('<form/>').append($fieldset);
    },

    /**
     * Helper function to convert HH:MM time string to minutes from midnight
     */
    _timeToMinutes: function(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    },

    /**
     * Cria a tabela com o resultado das horas trabalhadas e gráficos usando Chart.js
     */
    _criaRelatorio: function(strData) {
        // Remove existing report and charts
        $('.widget-relatorio').remove();
        $('.widget-grafico').remove();

        const allRecords = getFromLS(LS_KEYS.RECORDS);
        const currentUserId = localStorage.getItem('id');
        const filterMonth = strData.substring(0, 7); // YYYY-MM

        // Filter all records for the current user and selected month
        const filteredRecords = allRecords.filter(record => {
            const recordMonth = record.data.substring(0, 7);
            return record.usuarioId === currentUserId && recordMonth === filterMonth;
        });

        // Aggregate records by day and then process into logical rows
        const dailyGroupedPunches = {};
        filteredRecords.forEach(record => {
            const date = record.data;
            if (!dailyGroupedPunches[date]) {
                dailyGroupedPunches[date] = {
                    punches: [],
                    obs: []
                };
            }
            dailyGroupedPunches[date].punches.push(record);
            if (record.observacao) {
                dailyGroupedPunches[date].obs.push(record.observacao);
            }
        });

        const finalProcessedRecords = []; // This will be the flat array of all rows for the month
        const dailyChartMinutes = {}; // Stores total minutes worked per day for charts

        // Iterate through each day's punches to create logical rows and aggregate chart data
        Object.keys(dailyGroupedPunches).sort().forEach(date => {
            const dayData = dailyGroupedPunches[date];
            const punches = dayData.punches.sort((a, b) => Ponto._timeToMinutes(a.time) - Ponto._timeToMinutes(b.time));
            const dayObservations = dayData.obs.join('; '); // Combine all observations for the day

            let currentEntryTime = null;
            let dayTotalMinutesWorked = 0; // Accumulator for this specific day's total minutes

            for (const punch of punches) {
                if (punch.tipo === 'entrada') {
                    if (currentEntryTime !== null) {
                        // Previous entry was unmatched, create a row for it
                        finalProcessedRecords.push({
                            data: date,
                            entrada: currentEntryTime,
                            saida: '',
                            horas: '00:00',
                            totalMinutes: 0,
                            obs: dayObservations
                        });
                    }
                    currentEntryTime = punch.time;
                } else if (punch.tipo === 'saida') {
                    if (currentEntryTime !== null) {
                        // Found a pair
                        const [entryH, entryM] = currentEntryTime.split(':').map(Number);
                        const [exitH, exitM] = punch.time.split(':').map(Number);
                        const durationMinutes = (exitH * 60 + exitM) - (entryH * 60 + entryM);
                        
                        dayTotalMinutesWorked += durationMinutes; // Accumulate for charts

                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        const formattedHours = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                        finalProcessedRecords.push({
                            data: date,
                            entrada: currentEntryTime,
                            saida: punch.time,
                            horas: formattedHours,
                            totalMinutes: durationMinutes,
                            obs: dayObservations
                        });
                        currentEntryTime = null; // Reset for next pair
                    } else {
                        // This is an unmatched exit. Add it to the report.
                        finalProcessedRecords.push({
                            data: date,
                            entrada: '', // No entry for this exit
                            saida: punch.time,
                            horas: '00:00', // No duration for unmatched exit
                            totalMinutes: 0,
                            obs: dayObservations // Use day's observations for consistency
                        });
                    }
                }
            }

            // After loop, if there's an unmatched entry
            if (currentEntryTime !== null) {
                finalProcessedRecords.push({
                    data: date,
                    entrada: currentEntryTime,
                    saida: '',
                    horas: '00:00',
                    totalMinutes: 0,
                    obs: dayObservations
                });
            }
            
            // Store dayTotalMinutesWorked for chart aggregation
            dailyChartMinutes[date] = dayTotalMinutesWorked;
        });

        // Create new report container
        $('<div/>').attr('class', 'widget-relatorio')
            .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
            .append($('<table/>')
                .attr('id', 'tbRelatorio'))
            .appendTo($('#Ponto'));

        // Create table headers for grouped punches
        $('<thead/>')
            .append($('<tr/>')
                .append($('<th/>')
                    .addClass('data')
                    .html('Data'))
                .append($('<th/>')
                    .addClass('entrada')
                    .html('Entrada'))
                .append($('<th/>')
                    .addClass('saida')
                    .html('Saída'))
                .append($('<th/>')
                    .addClass('horas')
                    .html('Horas')))
            .addClass('ui-widget-header ui-helper-clearfix ui-corner-all')
            .appendTo($('#tbRelatorio'));

        $('<tbody/>').appendTo($('#tbRelatorio'));

        if (finalProcessedRecords.length !== 0) {
            $.each(finalProcessedRecords, function() {
                const $linha = $('<tr/>')
                    .appendTo($('#tbRelatorio tbody'));

                $linha.append($('<td/>')
                        .addClass('data')
                        .html(this.data))
                    .append($('<td/>')
                        .addClass('entrada')
                        .html(this.entrada))
                    .append($('<td/>')
                        .addClass('saida')
                        .html(this.saida))
                    .append($('<td/>')
                        .addClass('horas')
                        .html(this.horas));

                if (this.obs && this.obs.length !== 0) {
                    $linha.attr('title', this.obs)
                        .addClass('comObs')
                        .tinyTips('title');
                }

                // Add classes for visual feedback based on daily hours
                const horas_dia = parseInt(localStorage.getItem('horas_dia'), 10);
                const intExpediente = horas_dia * 60;
                // Apply 'expedienteMenor' class based on the day's total minutes, not individual row's duration
                // This logic will be applied after all rows are rendered, based on dailyChartMinutes
            });

            // After rendering all rows, apply 'expedienteMenor' class based on daily totals
            Object.keys(dailyChartMinutes).forEach(dayDate => {
                const totalMinutesForDay = dailyChartMinutes[dayDate];
                const horas_dia = parseInt(localStorage.getItem('horas_dia'), 10);
                const intExpediente = horas_dia * 60;
                
                // Find all rows for this day and apply class if total minutes are less than target
                if (totalMinutesForDay < intExpediente) {
                    $(`#tbRelatorio tbody tr:has(td.data:contains('${dayDate}'))`).addClass('expedienteMenor');
                }
            });


            // --- Chart Data Aggregation ---
            const horas_dia_config = parseInt(localStorage.getItem('horas_dia'), 10);
            const intExpediente_config = horas_dia_config * 60; // Daily target in minutes

            let intExpedienteCheio = 0;
            let intExpedienteIncompleto = 0;
            const arrExpedienteHoras = {}; // Stores total hours per day (in hours)
            let monthTotalMinutesWorked = 0; // Total minutes for the month

            // Now process dailyChartMinutes for chart data
            Object.keys(dailyChartMinutes).sort().forEach(dateKey => {
                const totalMinutesForDay = dailyChartMinutes[dateKey];
                const day = parseInt(dateKey.substr(8, 2), 10);
                const totalHoursForDay = totalMinutesForDay / 60;
                
                arrExpedienteHoras[day] = totalHoursForDay; // For 'Horas/Dia' chart
                monthTotalMinutesWorked += totalMinutesForDay; // For 'Meta Mensal' chart

                // For 'Assiduidade' chart: check if day met target (only if there was any work)
                if (totalMinutesForDay > 0) { // Only count days where there was actual work recorded
                    if (totalMinutesForDay >= intExpediente_config) {
                        intExpedienteCheio++;
                    } else {
                        intExpedienteIncompleto++;
                    }
                }
            });

            // Update intHorasTotal for 'Meta Mensal' chart
            const intHorasTotal = monthTotalMinutesWorked / 60; // Convert total minutes to hours for display


            // Criação dos containers para gráficos Chart.js
            $('<div/>').addClass('widget-grafico').append($('<canvas/>').attr('id', 'chart-assiduidade').attr('width', 250).attr('height', 150)).appendTo($('#Ponto'));
            $('<div/>').addClass('widget-grafico').append($('<canvas/>').attr('id', 'chart-horas-dia').attr('width', 250).attr('height', 150)).appendTo($('#Ponto'));
            $('<div/>').addClass('widget-grafico').append($('<canvas/>').attr('id', 'chart-meta-horas').attr('width', 250).attr('height', 120)).appendTo($('#Ponto'));

            // Gráfico de pizza - Assiduidade
            const ctxAssiduidade = document.getElementById('chart-assiduidade').getContext('2d');
            new Chart(ctxAssiduidade, {
                type: 'pie',
                data: {
                    labels: ['Sim', 'Não'],
                    datasets: [{
                        label: 'Assiduidade',
                        data: [intExpedienteCheio, intExpedienteIncompleto],
                        backgroundColor: ['#4CAF50', '#F44336']
                    }]
                },
                options: {
                    responsive: false,
                    plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Assiduidade' } }
                }
            });

            // Gráfico barras - Horas por dia
            const ctxHorasDia = document.getElementById('chart-horas-dia').getContext('2d');
            new Chart(ctxHorasDia, {
                type: 'bar',
                data: {
                    labels: Object.keys(arrExpedienteHoras).map(d => 'Dia ' + d),
                    datasets: [{
                        label: 'Horas/Dia',
                        data: Object.values(arrExpedienteHoras),
                        backgroundColor: '#41599b'
                    }]
                },
                options: {
                    responsive: false,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: { title: { display: true, text: 'Horas/Dia' } }
                }
            });

            // Gráfico barras - Meta mensal de horas
            const arrDiasTrabalhoMeta = localStorage.getItem('dias_trabalho').split(',');
            const intDiasMesLastDay = parseInt($('.ui-datepicker-calendar tr .ui-state-default:last').text());
            let intDiasMeta = 0;

            const arrDataSplit = strData.split('-');
            let objDataLoop = new Date(arrDataSplit[0], arrDataSplit[1] - 1, 1);

            for (let i = 1; i <= intDiasMesLastDay; i++) {
                if ($.inArray(objDataLoop.getDay().toString(), arrDiasTrabalhoMeta) >= 0) {
                    intDiasMeta++;
                }
                objDataLoop.setDate(objDataLoop.getDate() + 1);
            }

            const ctxMetaHoras = document.getElementById('chart-meta-horas').getContext('2d');
            const intHorasMes = horas_dia_config * intDiasMeta;
            new Chart(ctxMetaHoras, {
                type: 'bar',
                data: {
                    labels: ['Meta Mensal'],
                    datasets: [
                        {
                            label: 'Cumpridas (' + intHorasTotal.toFixed(2) + ')',
                            data: [intHorasTotal],
                            backgroundColor: '#DDD6F5'
                        },
                        {
                            label: 'Mensal (' + intHorasMes + ')',
                            data: [intHorasMes],
                            backgroundColor: '#5131C9'
                        }
                    ]
                },
                options: {
                    responsive: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: { title: { display: true, text: 'Meta de horas do mês' } },
                    barPercentage: 0.5,
                    categoryPercentage: 0.5
                }
            });
        } else {
            $('<tr/>')
                .append(
                    $('<td/>').attr('colspan', '4').addClass('noResult').html('Sem dados')
                ).appendTo($('#tbRelatorio tbody'));
        }
    },

    /**
     * Remove uma lista de usuários do banco
     */
    _removerUsuario: function(lista) {
        // --- START LOCALSTORAGE IMPLEMENTATION ---
        let allUsers = getFromLS(LS_KEYS.USERS);
        let allRecords = getFromLS(LS_KEYS.RECORDS);

        const initialUserCount = allUsers.length;

        // Remove users from the list
        allUsers = allUsers.filter(user => !lista.includes(user.id));

        // Remove records associated with deleted users
        allRecords = allRecords.filter(record => !lista.includes(record.usuarioId));

        if (allUsers.length < initialUserCount) {
            saveToLS(LS_KEYS.USERS, allUsers);
            saveToLS(LS_KEYS.RECORDS, allRecords);
            Ponto.usuarios();
        } else {
            $(this).dialog('close');
            Ponto._showErro('Não foi possível remover os usuários selecionados.');
        }
        // --- END LOCALSTORAGE IMPLEMENTATION ---
    },

    /**
     * Troca de sessão, se loga como um usuário subordinado
     */
    _trocaUsuario: function(objUsuario) {
        $('<div/>')
            .attr('id', 'troca-form')
            .html('Você deseja efetuar login como este usuário?')
            .appendTo($('#Ponto'));

        $("#troca-form").dialog({
            title: 'Logar como usuário',
            width: 350,
            modal: true,
            resizable: false,
            buttons: {
                "Continuar": function() {
                    // salvo o estado do usuário inicial
                    if (localStorage.getItem('inicial') == null) {
                        localStorage.setItem('inicial', JSON.stringify({
                            'id': localStorage.getItem('id'),
                            'nome': localStorage.getItem('nome'),
                            'login': localStorage.getItem('login'),
                            'email': localStorage.getItem('email'),
                            'horas_dia': localStorage.getItem('horas_dia'),
                            'horas_almoco': localStorage.getItem('horas_almoco'),
                            'dias_trabalho': localStorage.getItem('dias_trabalho'),
                            'owner': localStorage.getItem('owner')
                        }));
                    }

                    Ponto._criaSessao(objUsuario);

                    $(this).dialog('close');

                    $("#cadastro-form").remove();
                    $(".widget-usuarios").remove();

                    Ponto.init();
                },
                "Fechar": function() {
                    $(this).dialog('close');

                    $('#cadastro-form').remove();
                }
            },
            close: function() {
                $("#cadastro-form").remove();
            }
        });
    },

    /**
     * Modal de erro
     */
    _showErro: function(mensagem) {
        $('<div/>')
            .html(mensagem)
            .attr('id', 'error')
            .appendTo($('#Ponto'))
            .dialog({
                title: 'Erro',
                width: 350,
                resizable: false,
                modal: true,
                buttons: {
                    'Fechar': function() {
                        $(this).dialog('close');

                        $('#error').remove();
                    }
                }
            });
    },

    /**
     * Modal de mensagem
     */
    _showMsg: function(mensagem) {
        $('<div/>')
            .html(mensagem)
            .attr('id', 'message')
            .appendTo($('#Ponto'))
            .dialog({
                title: '',
                width: 350,
                resizable: false,
                modal: true,
                buttons: {
                    'Fechar': function() {
                        $(this).dialog('close');

                        $('#message').remove();
                    }
                }
            });
    },

    /**
     * Crio a sessão do usuário no localStorage do navegador (HTML5)
     */
    _criaSessao: function(dados) {
        for (var indice in dados) {
            if (dados.hasOwnProperty(indice)) {
                localStorage.setItem(indice, dados[indice]);
            }
        }
    },

    /**
     * Remove apenas os dados da sessão atual do localStorage.
     * Mantém os dados de usuários e registros.
     */
    _clearSessionData: function() {
        const sessionKeys = ['id', 'nome', 'login', 'email', 'senha', 'horas_dia', 'horas_almoco', 'dias_trabalho', 'owner'];
        sessionKeys.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('inicial'); // Also remove the 'inicial' key if it exists
    },

    /**
     * Validação do form de cadastro
     */
    _validaCadastro: function() {
        const bValid = []; // Changed to array to collect messages

        if ($('#nome').val().toString().length === 0) {
            bValid.push('Nome inválido.');
        }

        if ($('#usuario').val().toString().length === 0) {
            bValid.push('Login inválido.');
        }

        if ($('#email').val().toString().match(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/) === null) {
            bValid.push('E-mail inválido.');
        }

        if ($('input[type=password]').is(':visible')) {
            if ($('#senha').val().toString().length === 0) {
                bValid.push('Senha inválida.');
            }

            if ($('#senha_confirmacao').val() !== $('#senha').val()) {
                bValid.push('Senha e confirmação são diferentes.');
            }
        }

        if ($('#horas_dia').val().toString().match(/^[0-9]+$/) === null) {
            bValid.push('Carga horária inválida.');
        }

        // Check if horas_almoco is valid only if horas_dia is valid
        if (bValid.length === 0 && $('#horas_almoco').val().toString().match(/^[0-9]+$/) === null) {
            bValid.push('Intervalo inválido.');
        }

        if (parseInt($('#horas_dia').val()) < parseInt($('#horas_almoco').val())) {
            bValid.push('Você não pode ter um intervalo maior que sua carga horária.');
        }

        return bValid.join('<br>'); // Join messages with <br>
    },

    /**
     * Inserir usuário subordinado
     */
    _adicionarUsuario: function() {
        $('<div/>')
            .attr('id', 'cadastro-form')
            .appendTo($('#Ponto'));

        $(Ponto._formCadastro()).appendTo($('#cadastro-form'));

        $('#cadastro-form form #owner').val(localStorage.id);

        $("#cadastro-form").dialog({
            title: 'Cadastro',
            width: 300,
            modal: true,
            resizable: false,
            buttons: {
                "Cadastrar": function() {
                    const bValid = Ponto._validaCadastro(); // Changed var to const

                    if (bValid.length === 0) {
                        // --- START LOCALSTORAGE IMPLEMENTATION ---
                        let allUsers = getFromLS(LS_KEYS.USERS);
                        const newUserId = generateUniqueId(LS_KEYS.NEXT_USER_ID);
                        const newUserData = {
                            id: newUserId,
                            nome: $('#cadastro-form form #nome').val(),
                            login: $('#cadastro-form form #usuario').val(),
                            email: $('#cadastro-form form #email').val(),
                            senha: hashPassword($('#cadastro-form form #senha').val()), // Hash the password
                            horas_dia: $('#cadastro-form form #horas_dia').val(),
                            horas_almoco: $('#cadastro-form form #horas_almoco').val(),
                            dias_trabalho: $('#cadastro-form form input[name="dias_trabalho[]"]:checked').map(function() { return $(this).val(); }).get().join(','),
                            owner: localStorage.getItem('id')
                        };

                        // Check for duplicate login
                        if (allUsers.some(user => user.login === newUserData.login)) {
                            Ponto._showErro('Login já existe. Por favor, escolha outro.');
                            return;
                        }

                        allUsers.push(newUserData);
                        saveToLS(LS_KEYS.USERS, allUsers);

                        $(this).dialog('close');
                        $('#cadastro-form').remove();
                        Ponto._showMsg('Usuário cadastrado.');
                        // --- END LOCALSTORAGE IMPLEMENTATION ---
                    }
                    else {
                        Ponto._showErro(bValid);
                    }
                },
                "Fechar": function() {
                    $(this).dialog('close');

                    $('#cadastro-form').remove();
                }
            },
            close: function() {
                $("#cadastro-form").remove();
            }
        });
    },

    /**
     * Cria o formulário de login
     */
    login: function() {
        $('<div/>')
            .attr('id', 'login-form')
            .appendTo($('#Ponto'));

        $('#login-form').append(Ponto._formLogin());

        $("#login-form").dialog({
            title: 'Efetuar login',
            width: 260,
            modal: true,
            resizable: false,
            buttons: {
                "Login": function() {
                    let bValid = true; // Changed var to let
                    bValid = bValid && $('#usuario').val().length !== 0;
                    bValid = bValid && $('#senha').val().length !== 0;

                    if (bValid === true) {
                        // --- START LOCALSTORAGE IMPLEMENTATION ---
                        const users = getFromLS(LS_KEYS.USERS);
                        const username = $('#login-form form #usuario').val();
                        const password = $('#login-form form #senha').val();
                        const hashedPassword = hashPassword(password); // Hash the input password

                        const foundUser = users.find(user => user.login === username && user.senha === hashedPassword); // Compare with hashed password

                        if (foundUser) {
                            Ponto._criaSessao(foundUser);
                            Ponto.init();
                        } else {
                            Ponto._showErro('Usuário ou senha inválidos.');
                        }
                        // --- END LOCALSTORAGE IMPLEMENTATION ---
                    }
                    else {
                        Ponto._showErro('Preencha todos os campos');
                    }
                },
                "Cadastro": function() {
                    $('#login-form').dialog('close');
                    $('#login-form').remove();

                    Ponto.cadastro();
                }
            },
            close: function() {
                $('#login-form').remove();

                Ponto.login();
            }
        });
    },

    /**
     * Encerra a sessão do usuário
     */
    logout: function() {
        let mensagem = ''; // Changed var to let

        // retomar sessão original
        if (localStorage.getItem('inicial') !== null) {
            const original = JSON.parse(localStorage.getItem('inicial')); // Changed var to const
            mensagem = 'Sair do sistema ou apenas \nretornar ao usuário \noriginal?';

            $('<div/>')
                .attr('id', 'troca-form')
                .html(mensagem)
                .appendTo($('#Ponto'))
                .dialog({
                    title: 'Logout',
                    width: 400,
                    modal: true,
                    resizable: false,
                    buttons: {
                        "Voltar ao estado inicial": function() {
                            // salvo o estado do usuário inicial
                            Ponto._criaSessao(original);

                            localStorage.removeItem('inicial');

                            $(this).dialog('close');
                            $("#troca-form").remove();

                            Ponto.init();
                        },
                        "Logout": function() {
                            Ponto._clearSessionData();

                            $(this).dialog('close');
                            $("#troca-form").remove();

                            Ponto.init();
                        },
                        "Cancelar": function() {
                            $(this).dialog('close');
                        }
                    },
                    close: function() {
                        $("#troca-form").remove();
                    }
                });
        }
        else {
            mensagem = 'Efetuar logout?';

            $('<div/>')
                .attr('id', 'troca-form')
                .html(mensagem)
                .appendTo($('#Ponto'))
                .dialog({
                    title: 'Logout',
                    width: 350,
                    modal: true,
                    resizable: false,
                    buttons: {
                        "Continuar": function() {
                            Ponto._clearSessionData();

                            $(this).dialog('close');

                            Ponto.init();
                        },
                        "Cancelar": function() {
                            $(this).dialog('close');
                        }
                    },
                    close: function() {
                        $("#troca-form").remove();
                    }
                });
        }
    },

    /**
     * Registro de ponto
     */
    ponto: function() {
        const arrDiasTrabalho = localStorage.getItem('dias_trabalho').split(','); // Changed var to const
        const objData = new Date(); // Changed var to const

        if ($.inArray(objData.getDay().toString(), arrDiasTrabalho) >= 0) {
            $('<div/>')
                .attr('id', 'ponto-form')
                .appendTo($('#Ponto'));

            $('#ponto-form')
                .append(Ponto._formPonto())
                .dialog({
                    title: 'Registro de Ponto',
                    width: 350,
                    modal: true,
                    resizable: false,
                    buttons: {
                        "Registrar": function() {
                            // --- START LOCALSTORAGE IMPLEMENTATION ---
                            let allRecords = getFromLS(LS_KEYS.RECORDS);
                            const newRecordId = generateUniqueId(LS_KEYS.NEXT_RECORD_ID);
                            const currentUserId = localStorage.getItem('id');
                            const now = new Date();
                            const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
                            const timeString = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

                            // Determine if it's an entry or exit based on the last punch
                            const todayRecords = allRecords.filter(r => r.usuarioId === currentUserId && r.data === dateString);
                            
                            // Sort records by time to find the last punch chronologically
                            todayRecords.sort((a, b) => Ponto._timeToMinutes(a.time) - Ponto._timeToMinutes(b.time));

                            let type;
                            if (todayRecords.length === 0) {
                                type = 'entrada'; // First punch of the day
                            } else {
                                const lastPunch = todayRecords[todayRecords.length - 1];
                                type = lastPunch.tipo === 'entrada' ? 'saida' : 'entrada'; // Alternate type
                            }

                            const newRecord = {
                                id: newRecordId,
                                usuarioId: currentUserId,
                                data: dateString,
                                time: timeString,
                                tipo: type,
                                observacao: $("#ponto-form #observacao").val()
                            };

                            allRecords.push(newRecord);
                            saveToLS(LS_KEYS.RECORDS, allRecords);

                            $(this).dialog('close');
                            $("#ponto-form").remove();

                            $('<div/>').html('Ponto registrado com sucesso!')
                                .attr('id', 'sucesso-ponto')
                                .appendTo($('#Ponto'))
                                .dialog({
                                    title: 'Registro de Ponto',
                                    width: 250,
                                    resizable: false,
                                    modal: true,
                                    buttons: {
                                        'Fechar': function() {
                                            $('#sucesso-ponto').remove();
                                            Ponto.relatorio();
                                        }
                                    }
                                });
                            // --- END LOCALSTORAGE IMPLEMENTATION ---
                        },
                        "Fechar": function() {
                            $(this).dialog('close');
                        }
                    },
                    close: function() {
                        $("#ponto-form").remove();
                    }
                });
        }
        else {
            Ponto._showErro('Pelas suas configurações, não é possível bater o ponto hoje.');
        }
    },

    /**
     * Configurações do usuário
     */
    preferencias: function() {
        $('<div/>')
            .attr('id', 'cadastro-form')
            .addClass('widget-preferencias')
            .appendTo($('#Ponto'));

        $(Ponto._formCadastro()).appendTo($('#cadastro-form'));

        // preencho o formulário
        $('#cadastro-form form #nome').val(localStorage.getItem('nome'));
        $('#cadastro-form form #email').val(localStorage.getItem('email'));
        $('#cadastro-form form #usuario').val(localStorage.getItem('login')).attr('readonly', 'readonly');
        $('#cadastro-form form #id').val(localStorage.getItem('id'));
        $('#cadastro-form form #owner').val(localStorage.getItem('owner'));
        $('#cadastro-form form #horas_dia').val(localStorage.getItem('horas_dia'));
        $('#cadastro-form form #horas_almoco').val(localStorage.getItem('horas_almoco'));

        $('#cadastro-form form input#usuario').hide();
        $('#cadastro-form form input#usuario').parent().hide();

        $('#cadastro-form form input[type=password]').hide();
        $('#cadastro-form form input[type=password]').parent().hide();

        // marco os dias da semana que são trabalhados
        const $dias = localStorage.getItem('dias_trabalho').split(','); // Changed var to const

        $('#cadastro-form form input[type=checkbox]')
            .attr('checked', false);

        for (const i in $dias) { // Changed var to const
            $('#cadastro-form form #dias_trabalho_' + $dias[i])
                .attr('checked', true);
        }

        $("#cadastro-form").dialog({
            title: 'Preferências',
            width: 340,
            modal: true,
            resizable: false,
            buttons: {
                "Atualizar": function() {
                    const bValid = Ponto._validaCadastro(); // Changed var to const

                    if (bValid.length === 0) {
                        // --- START LOCALSTORAGE IMPLEMENTATION ---
                        let allUsers = getFromLS(LS_KEYS.USERS);
                        const userId = localStorage.getItem('id');
                        const userIndex = allUsers.findIndex(user => user.id === userId);

                        if (userIndex !== -1) {
                            const updatedUserData = {
                                ...allUsers[userIndex],
                                nome: $('#cadastro-form form #nome').val(),
                                email: $('#cadastro-form form #email').val(),
                                horas_dia: $('#cadastro-form form #horas_dia').val(),
                                horas_almoco: $('#cadastro-form form #horas_almoco').val(),
                                dias_trabalho: $('#cadastro-form form input[name="dias_trabalho[]"]:checked').map(function() { return $(this).val(); }).get().join(',')
                            };

                            // Only update password if visible and provided
                            if ($('#cadastro-form form input[type=password]').is(':visible') && $('#cadastro-form form #senha').val().length > 0) {
                                updatedUserData.senha = hashPassword($('#cadastro-form form #senha').val()); // Hash the new password
                            }

                            allUsers[userIndex] = updatedUserData;
                            saveToLS(LS_KEYS.USERS, allUsers);

                            Ponto._criaSessao(updatedUserData); // Update current session
                            $(this).dialog('close');
                            $('#cadastro-form').remove();
                            Ponto.init();
                        } else {
                            Ponto._showErro('Usuário não encontrado para atualização.');
                        }
                        // --- END LOCALSTORAGE IMPLEMENTATION ---
                    }
                    else {
                        Ponto._showErro(bValid);
                    }
                },
                "Trocar Senha": function() {
                    $('#cadastro-form form input[type=password]').toggle();
                    $('#cadastro-form form input[type=password]').parent().toggle();
                },
                "Fechar": function() {
                    $(this).dialog('close');

                    $('#cadastro-form').remove();
                }
            },
            close: function() {
                $("#cadastro-form").remove();
            }
        });
    },

    /**
     * Crio o form de cadastro
     */
    cadastro: function() {
        $('<div/>')
            .attr('id', 'cadastro-form')
            .appendTo($('#Ponto'));

        $(Ponto._formCadastro()).appendTo($('#cadastro-form'));

        $("#cadastro-form").dialog({
            title: 'Cadastro',
            width: 280,
            modal: true,
            resizable: false,
            buttons: {
                "Cadastrar": function() {
                    const bValid = Ponto._validaCadastro(); // Changed var to const

                    if (bValid.length === 0) {
                        // --- START LOCALSTORAGE IMPLEMENTATION ---
                        let allUsers = getFromLS(LS_KEYS.USERS);
                        const newUserId = generateUniqueId(LS_KEYS.NEXT_USER_ID);
                        const newUserData = {
                            id: newUserId,
                            nome: $('#cadastro-form form #nome').val(),
                            login: $('#cadastro-form form #usuario').val(),
                            email: $('#cadastro-form form #email').val(),
                            senha: hashPassword($('#cadastro-form form #senha').val()), // Hash the password
                            horas_dia: $('#cadastro-form form #horas_dia').val(),
                            horas_almoco: $('#cadastro-form form #horas_almoco').val(),
                            dias_trabalho: $('#cadastro-form form input[name="dias_trabalho[]"]:checked').map(function() { return $(this).val(); }).get().join(','),
                            owner: null // Top-level user
                        };

                        // Check for duplicate login
                        if (allUsers.some(user => user.login === newUserData.login)) {
                            Ponto._showErro('Login já existe. Por favor, escolha outro.');
                            return;
                        }

                        allUsers.push(newUserData);
                        saveToLS(LS_KEYS.USERS, allUsers);

                        Ponto._criaSessao(newUserData);
                        $(this).dialog('close');
                        $("#cadastro-form").remove();
                        $("#login-form").remove();

                        Ponto.init();
                        Ponto._showMsg('Bem vindo :)');
                        // --- END LOCALSTORAGE IMPLEMENTATION ---
                    }
                    else {
                        Ponto._showErro(bValid);
                    }
                },
                "Fechar": function() {
                    $(this).dialog('close');
                }
            },
            close: function() {
                $("#cadastro-form").remove();

                Ponto.login();
            }
        });
    },

    /**
     * Relatório de horas trabalhadas
     */
    relatorio: function() {
        $('#Ponto').empty();

        const objData = new Date();
        const mesAtual = objData.getMonth() + 1;
        const diaAtual = objData.getDate();

        const mes = mesAtual < 10 ? '0' + mesAtual : mesAtual;
        const dia = diaAtual < 10 ? '0' + diaAtual : diaAtual;
        const ano = objData.getFullYear();

        // monto um calendário para poder filtrar o relatório
        $('<div/>')
            .attr('class', 'widget-calendario')
            .appendTo($('#Ponto'))
            .datepicker({
                monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro',
                    'Dezembro'
                ],
                dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
                dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta',
                    'Sexta', 'Sábado'
                ],
                dateFormat: 'yy-mm-dd',
                firstDay: 0,
                prevText: 'Anterior',
                nextText: 'Pr&oacute;ximo',
                defaultDate: ano + '-' + mes + '-' + dia,
                showOtherMonths: false,
                selectOtherMonths: false,
                hideIfNoPrevNext: true,
                maxDate: '+0d',
                onSelect: function(dateText, inst) {
                    const arrData = dateText.split('-');
                    const strData = arrData[0] + '-' + arrData[1] + '-' + arrData[2];

                    Ponto._criaRelatorio(strData);
                },
                onChangeMonthYear: function(year, month, inst) {
                    // Datepicker month is 1-indexed, so no need to adjust
                    const formattedMonth = month < 10 ? '0' + month : month;
                    Ponto._criaRelatorio(year + '-' + formattedMonth + '-01'); // Pass first day of month for consistency
                }
            });

        // crio um relatório com a data atual
        Ponto._criaRelatorio(ano + '-' + mes + '-' + dia);
    },

    /**
     * Listagem de usuários cadastrados subordinados ao usuário logado
     */
    usuarios: function() {
        $('<div/>')
            .addClass('widget-usuarios')
            .appendTo($('#Ponto'));

        // --- START LOCALSTORAGE IMPLEMENTATION ---
        const allUsers = getFromLS(LS_KEYS.USERS);
        const currentUserId = localStorage.getItem('id');
        const retorno = allUsers.filter(user => user.owner === currentUserId);
        // --- END LOCALSTORAGE IMPLEMENTATION ---

        if (retorno.length !== 0) {
            $('<table/>')
                .attr('id', 'tbUsuarios')
                .appendTo($('.widget-usuarios'));

            $('<tbody/>')
                .append($('<tr/>')
                    .append($('<td/>')
                        .addClass('id')
                        .html('#'))
                    .append($('<td/>')
                        .addClass('login')
                        .html('Login'))
                    .append($('<td/>')
                        .addClass('nome')
                        .html('Nome'))
                    .append($('<td/>')
                        .addClass('email')
                        .html('E-mail'))
                    .append($('<td/>')
                        .addClass('expediente')
                        .html('Expediente'))
                    .addClass('ui-widget-header'))
                .appendTo($('#tbUsuarios'));

            $.each(retorno, function(intLinha, objUsuario) {
                const $linha = $('<tr/>').appendTo($('#tbUsuarios tbody')); // Changed var to const

                $linha.append($('<td/>')
                        .addClass('id')
                        .append($('<input/>')
                            .attr('type', 'checkbox')
                            .attr('name', 'usuario[]')
                            .attr('id', 'usuario_' + this.id)
                            .val(this.id)
                        ))
                    .append($('<td/>')
                        .addClass('login')
                        .html(this.login)
                        .click(function() {
                            Ponto._trocaUsuario(objUsuario);
                        }))
                    .append($('<td/>')
                        .addClass('nome')
                        .html(this.nome)
                        .click(function() {
                            Ponto._trocaUsuario(objUsuario);
                        }))
                    .append($('<td/>')
                        .addClass('email')
                        .html(this.email))
                    .append($('<td/>')
                        .addClass('expediente')
                        .html(this.horas_dia + ' / ' + this.horas_almoco));
            });
        }
        else {
            // sem sub usuários
            $('<div/>')
                .addClass('noResult')
                .html('Você não possui usuários cadastrados')
                .appendTo($('.widget-usuarios'));
        }

        $('.widget-usuarios').dialog({
            title: 'Usuários',
            width: 640,
            modal: true,
            resizable: false,
            buttons: {
                'Cadastrar Usuário': function() {
                    Ponto._adicionarUsuario();
                },
                'Remover selecionados': function() {
                    const $selecionados = $('#tbUsuarios input:checkbox:checked'); // Changed var to const
                    const $lista = []; // Changed var to const and initialized as array

                    $selecionados.each(function() { // Removed i parameter as it's not used
                        $lista.push($(this).val());
                    });

                    if ($lista.length !== 0) {
                        const $msg = 'Remover permanentemente o(s) usuário(s) selecionado(s)? <br/>' + 'Todos os dados relacionados a este usuário ' + 'serão removidos de forma irreversível.'; // Changed var to const

                        $('<div/>')
                            .attr('id', 'apagar-form')
                            .html($msg)
                            .appendTo($('#Ponto'))
                            .dialog({
                                title: 'Remover usuários',
                                width: 400,
                                modal: true,
                                resizable: false,
                                buttons: {
                                    "Continuar": function() {
                                        $(this).dialog('close');

                                        $('#apagar-form').remove();
                                        $(".widget-usuarios").remove();

                                        Ponto._removerUsuario($lista);
                                        Ponto.init();
                                    },
                                    "Fechar": function() {
                                        $(this).dialog('close');

                                        $('#apagar-form').remove();
                                    }
                                },
                                close: function() {
                                    $("#apagar-form").remove();
                                }
                            });
                    }
                    else {
                        Ponto._showErro('Selecione algum usuário para remover.');
                    }
                },
                "Fechar": function() {
                    $(this).dialog('close');

                    $(".widget-usuarios").remove();
                }
            },
            close: function() {
                $(".widget-usuarios").remove();
            }
        });
    }
};