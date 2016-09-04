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
 * @version    $Revision: 0.2 $
 * @license    http://www.opensource.org/licenses/mit-license.php The MIT License
 */
var Ponto = {
    apiServer: 'https://ponto-mrprompt.rhcloud.com',

    /**
     * Cria o ambiente
     */
    init: function() {
        $('body > #container').empty();

        $('<section/>').attr('id', 'Ponto').appendTo($('#container'));

        if (localStorage.getItem('id') !== null) {
            $('#login-form').dialog('close');
            $('#login-form').remove();

            var header = $('<header/>');
            var menu = $('<ul/>');

            header
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
                                })))
                        .append($('<li/>')
                            .append($('<a/>')
                                .html('Preferências')
                                .attr('href', 'javascript:;')
                                .button()
                                .click(function() {
                                    Ponto.preferencias();
                                }))))
                    .append($('<span/>')
                        .html('Logado como: ')
                        .append($('<br/>'))
                        .append($('<b/>').html(localStorage.getItem('nome')))))
                .insertBefore($('#Ponto'));

            if (localStorage.getItem('owner') == 'null') {
                menu
                    .append($('<li/>')
                        .append($('<a/>')
                            .html('Usuários')
                            .attr('href', 'javascript:;')
                            .button()
                            .click(function() {
                                Ponto.usuarios();
                            })))
            }

            menu.append($('<li/>')
                .append($('<a/>')
                    .html('Sair')
                    .attr('href', 'javascript:;')
                    .button()
                    .click(function() {
                        Ponto.logout();
                    })));

            // escondo o botão de ponto caso hoje não seja um dia de trabalho
            // setado nas configurações do usuário
            var arrDiasTrabalho = localStorage.getItem('dias_trabalho').split(',');
            var objData = new Date();

            if ($.inArray(objData.getDay().toString(), arrDiasTrabalho) < 0) {
                $('header nav ul li:eq(0)').hide();
            }

            Ponto.relatorio();
        }
        else {
            Ponto.login();
        }
    },

    /**
     * Cria o formulário de login
     */
    _formLogin: function() {
        var $fieldset = $('<fieldset/>')
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
        var $fieldset = $('<fieldset/>')
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

        var $form = $('<form/>')
            .attr('id', 'frmCadastro')
            .append($fieldset);

        return $form;
    },

    /**
     * Formulário de inserção de hora-ponto
     */
    _formPonto: function() {
        var $fieldset = $('<fieldset/>')
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
     * Cria a tabela com o resultado das horas trabalhadas
     */
    _criaRelatorio: function(strData) {
        $('.widget-relatorio').remove();
        $('.widget-grafico').remove();

        $.ajax({
            type: 'POST',
            url: Ponto.apiServer + '/relatorio.php',
            data: {
                usuario: localStorage.getItem('id'),
                data: strData
            },
            success: function(retorno) {
                $('<div/>').attr('class', 'widget-relatorio')
                    .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
                    .append($('<table/>')
                        .attr('id', 'tbRelatorio'))
                    .appendTo($('#Ponto'));

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

                if (retorno.length !== 0) {
                    $.each(retorno, function() {
                        var $linha = $('<tr/>')
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

                        var $obs = this.obs;

                        if (typeof($obs) === 'string' && $obs.length !== 0) {
                            $linha.attr('title', $obs)
                                .addClass('comObs')
                                .tinyTips('title');
                        }
                    });

                    // verificando se cumpriu o expediente
                    var horas_dia = parseInt(localStorage.getItem('horas_dia'), 10);
                    var intExpediente = horas_dia * 60;
                    var intExpedienteCheio = 0;
                    var intExpedienteIncompleto = 0;
                    var arrExpedienteMinutos = new Array();
                    var arrExpedienteHoras = new Array();
                    var intHorasTotal = 0;

                    $('#tbRelatorio tbody tr').each(function() {
                        var $linha = $(this);
                        var strData = $linha.find('td:eq(0)').html();
                        var strHoras = $linha.find('td:eq(3)').html();
                        var intDia = parseInt(strData.substr(0, 2), 10);
                        var intHora = parseInt(strHoras.substr(0, 2), 10);
                        var intMinuto = parseInt(strHoras.substr(3, 2), 10);

                        // crio uma classe para todas as linhas de mesmo dia
                        $linha.addClass('dia' + intDia);

                        if (arrExpedienteMinutos[intDia]) {
                            arrExpedienteMinutos[intDia] = arrExpedienteMinutos[intDia] + ((intHora * 60) + intMinuto);
                        }
                        else {
                            arrExpedienteMinutos[intDia] = ((intHora * 60) + intMinuto);
                        }

                        arrExpedienteHoras[intDia] = arrExpedienteMinutos[intDia] / 60;
                    });

                    // marco todos os dias em que as horas do expediente não foram cumpridas
                    // e contabilizo para gerar o gráfico
                    for (var i in arrExpedienteMinutos) {
                        if (arrExpedienteMinutos[i] < intExpediente) {
                            $('#tbRelatorio tbody tr.dia' + i).addClass('expedienteMenor');

                            intExpedienteIncompleto++;
                        }
                        else {
                            intExpedienteCheio++;
                        }
                    }

                    // gero um gráfico de pizza com a média de cumprimento do expediente
                    var objGraphMedia = new jGCharts.Api();

                    $('<img>')
                        .attr('src', objGraphMedia.make({
                            data: [
                                [intExpedienteCheio],
                                [intExpedienteIncompleto]
                            ],
                            type: 'p3',
                            size: '250x150',
                            axis_labels: ['Sim', 'Não'],
                            title: 'Assiduidade'
                        }))
                        .addClass('widget-grafico')
                        .appendTo($('#Ponto'));

                    // gero um gráfico por dia de barras com as horas trabalhadas por dia
                    var objGraphExpediente = new jGCharts.Api();

                    $('<img>')
                        .attr('src', objGraphExpediente.make({
                            data: [arrExpedienteHoras],
                            axis_labels: ['Dias Trabalhados'],
                            size: '250x150',
                            type: 'bvg',
                            colors: ['41599b'],
                            bar_width: 5,
                            bar_spacing: 1,
                            title: 'Horas/Dia'
                        }))
                        .addClass('widget-grafico')
                        .appendTo($('#Ponto'));

                    // gero um gráfico informando se supriu as horas mensais
                    // contabilizando as horas trabalhadas
                    var arrDiasTrabalho = localStorage.getItem('dias_trabalho').split(',');
                    var intDiasMes = parseInt($('.ui-datepicker-calendar tr .ui-state-default:last').text());
                    var intDiasMeta = 0;

                    // aponto o objeto da data para o primeiro dia do mês informado
                    var arrData = strData.split('-');
                    var objData = new Date(arrData[0], arrData[1], arrData[2]);
                    objData.setMonth(arrData[1] - 1);
                    objData.setDate(1);

                    // contando os dias da semana que o usuário trabalha
                    for (i = 1; i <= intDiasMes; i++) {
                        var bUtil = $.inArray(objData.getDay().toString(), arrDiasTrabalho);

                        if (bUtil >= 0) {
                            intDiasMeta++;
                        }

                        objData.setDate(objData.getDate() + 1);
                    }

                    for (i in arrExpedienteHoras) {
                        intHorasTotal += parseInt(arrExpedienteHoras[i]);
                    }

                    var objGraphMeta = new jGCharts.Api();
                    var intHorasMes = horas_dia * intDiasMeta;

                    $('<img>')
                        .attr('src', objGraphMeta.make({
                            data: [
                                [intHorasTotal, intHorasMes]
                            ],
                            type: 'bhg',
                            size: '250x120',
                            axis_labels: [' '],
                            legend: ['Cumpridas (' + intHorasTotal + ')', 'Mensal (' + intHorasMes + ')'],
                            title: 'Meta de horas do mês',
                            colors: ['DDD6F5', '5131C9'],
                            bar_width: 30,
                            bar_spacing: 10,
                            grid: false
                        }))
                        .addClass('widget-grafico')
                        .appendTo($('#Ponto'));
                }
                else {
                    // sem relatório
                    $('<tr/>')
                        .append($('<td/>')
                            .attr('colspan', '4')
                            .addClass('noResult')
                            .html('Sem dados'))
                        .appendTo($('#tbRelatorio tbody'));
                }
            },
            dataType: 'json'
        });
    },

    /**
     * Remove uma lista de usuários do banco
     */
    _removerUsuario: function(lista) {
        $.ajax({
            type: 'POST',
            url: Ponto.apiServer + '/userdel.php',
            data: {
                usuario: localStorage.getItem('id'),
                usuarios: lista.join('|')
            },
            success: function(retorno) {
                if (retorno == true) {
                    Ponto.usuarios();
                }
                else {
                    $(this).dialog('close');

                    Ponto._showErro(retorno);
                }
            },
            dataType: 'json'
        });
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
            localStorage.setItem(indice, dados[indice]);
        }
    },

    /**
     * Validação do form de cadastro
     */
    _validaCadastro: function() {
        var bValid = new String();

        if ($('#nome').val().toString().length === 0) {
            bValid += 'Nome inválido.<br>';
        }

        if ($('#usuario').val().toString().length === 0) {
            bValid += 'Login inválido.<br>';
        }

        if ($('#email').val().toString().match(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/) === null) {
            bValid += 'E-mail inválido.<br>';
        }

        if ($('input[type=password]').is(':visible')) {
            if ($('#senha').val().toString().length === 0) {
                bValid += 'Senha inválida.<br>';
            }

            if ($('#senha_confirmacao').val() !== $('#senha').val()) {
                bValid += 'Senha e confirmação são diferentes.<br>';
            }
        }

        if ($('#horas_dia').val().toString().match(/^[0-9]+$/) === null) {
            bValid += 'Carga horária inválida.<br>';
        }

        if (bValid && $('#horas_almoco').val().toString().match(/^[0-9]+$/) === null) {
            bValid += 'Intervalo inválido.<br>';
        }

        if (parseInt($('#horas_dia').val()) < parseInt($('#horas_almoco').val())) {
            bValid += 'Você não pode ter um intervalo maior que sua carga horária.<br>';
        }

        return bValid;
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
            width: 250,
            modal: true,
            resizable: false,
            buttons: {
                "Cadastrar": function() {
                    var bValid = Ponto._validaCadastro();

                    if (bValid.length === 0) {
                        $.ajax({
                            type: 'POST',
                            url: Ponto.apiServer + '/cadastro.php',
                            data: $("#cadastro-form form").serialize(),
                            success: function(retorno) {
                                if (retorno.id) {
                                    $(this).dialog('close');

                                    $('#cadastro-form').remove();

                                    Ponto._showMsg('Usuário cadastrado.');
                                }
                                else {
                                    Ponto._showErro(retorno);
                                }
                            },
                            dataType: 'json'
                        });
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
            width: 250,
            modal: true,
            resizable: false,
            buttons: {
                "Login": function() {
                    var bValid = true;
                    bValid = bValid && $('#usuario').val().length !== 0;
                    bValid = bValid && $('#senha').val().length !== 0;

                    if (bValid === true) {
                        $.ajax({
                            type: 'POST',
                            url: Ponto.apiServer + '/login.php',
                            data: $("#login-form form").serialize(),
                            success: function(retorno) {
                                if (retorno.id) {
                                    Ponto._criaSessao(retorno);
                                    Ponto.init();
                                }
                                else {
                                    Ponto._showErro(retorno);
                                }
                            },
                            dataType: 'json'
                        });
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
        var mensagem = '';

        // retomar sessão original
        if (localStorage.getItem('inicial') !== null) {
            var original = JSON.parse(localStorage.getItem('inicial'));
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
                            localStorage.clear();

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
                            localStorage.clear();

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
        var arrDiasTrabalho = localStorage.getItem('dias_trabalho').split(',');
        var objData = new Date();

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
                            $.ajax({
                                type: 'POST',
                                url: Ponto.apiServer + '/ponto.php',
                                data: {
                                    observacao: $("#ponto-form #observacao").val(),
                                    usuario: localStorage.getItem('id'),
                                    tipo: $("#ponto-form input[@name='tipo']:checked").val()
                                },
                                success: function(retorno) {
                                    $(this).dialog('close');

                                    $("#ponto-form").remove();

                                    $('<div/>').html(retorno)
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
                                },
                                dataType: 'json'
                            });
                        },
                        "Fechar": function() {
                            $(this).dialog('close');
                        }
                    },
                    close: function() {
                        $("#ponto-form").remove();
                    }
                });

            // checando o botão correto
            if ($('#tbRelatorio')[0]) {
                if ($('#tbRelatorio tbody td.saida:first').text() == '') {
                    $('#tipoSaida').attr('checked', 'true');
                }
            }
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
        var $dias = localStorage.getItem('dias_trabalho').split(',');

        $('#cadastro-form form input[type=checkbox]')
            .attr('checked', false);

        for (var i in $dias) {
            $('#cadastro-form form #dias_trabalho_' + $dias[i])
                .attr('checked', true);
        }

        $("#cadastro-form").dialog({
            title: 'Preferências',
            width: 320,
            modal: true,
            resizable: false,
            buttons: {
                "Atualizar": function() {
                    var bValid = Ponto._validaCadastro();

                    if (bValid.length === 0) {
                        $.ajax({
                            type: 'POST',
                            url: Ponto.apiServer + '/cadastro.php',
                            data: $('#cadastro-form form').serialize(),
                            success: function(retorno) {
                                if (retorno.id) {
                                    if (retorno.id) {
                                        Ponto._criaSessao(retorno);

                                        $(this).dialog('close');
                                        $('#cadastro-form').remove();

                                        Ponto.init();
                                    }
                                    else {
                                        Ponto._showErro(retorno);
                                    }
                                }
                                else {
                                    $(this).dialog('close');

                                    Ponto._showErro(retorno);
                                }
                            },
                            dataType: 'json'
                        });
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
            width: 250,
            modal: true,
            resizable: false,
            buttons: {
                "Cadastrar": function() {
                    var bValid = Ponto._validaCadastro();

                    if (bValid.length === 0) {
                        $.ajax({
                            type: 'POST',
                            url: Ponto.apiServer + '/cadastro.php',
                            data: $("#cadastro-form form").serialize(),
                            success: function(retorno) {
                                if (retorno.id) {
                                    Ponto._criaSessao(retorno);

                                    $(this).dialog('close');
                                    $("#cadastro-form").remove();
                                    $("#login-form").remove();

                                    Ponto.init();
                                    Ponto._showMsg('Bem vindo :)');
                                }
                                else {
                                    Ponto._showErro(retorno);
                                }
                            },
                            dataType: 'json'
                        });
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

        var objData = new Date();
        var mesAtual = new Number(objData.getMonth()) + 1;
        var diaAtual = new Number(objData.getDate());

        var mes = mesAtual.length == 1 ? '0' + mesAtual : mesAtual;
        var dia = diaAtual.length == 1 ? '0' + diaAtual : diaAtual;
        var ano = objData.getFullYear();

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
                    var arrData = dateText.split('-');
                    var strData = arrData[0] + '-' + arrData[1] + '-' + arrData[2];

                    Ponto._criaRelatorio(strData);
                },
                onChangeMonthYear: function(year, month, inst) {
                    Ponto._criaRelatorio(year + '-' + month + '-31');
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

        $.ajax({
            type: 'POST',
            url: Ponto.apiServer + '/usuarios.php',
            data: {
                usuario: localStorage.getItem('id')
            },
            success: function(retorno) {
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
                        var $linha = $('<tr/>').appendTo($('#tbUsuarios tbody'));

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
                    width: 600,
                    modal: true,
                    resizable: false,
                    buttons: {
                        'Cadastrar Usuário': function() {
                            Ponto._adicionarUsuario();
                        },
                        'Remover selecionados': function() {
                            var $selecionados = $('#tbUsuarios input:checkbox:checked');
                            var $lista = new Array();

                            $selecionados.each(function(i) {
                                $lista[i] = $(this).val();
                            });

                            if ($lista.length !== 0) {
                                var $msg = 'Remover permanentemente o(s) usuário(s) selecionado(s)? <br/>' + 'Todos os dados relacionados a este usuário ' + 'serão removidos de forma irreversível.';

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
            },
            dataType: 'json'
        });
    }
};
