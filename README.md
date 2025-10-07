# Ponto Eletrônico

Ponto Eletrônico é uma aplicação web simples e intuitiva desenvolvida para auxiliar no controle e contabilização das horas trabalhadas. Criado inicialmente para atender necessidades pessoais e como um projeto de estudo, ele demonstra o poder da geração dinâmica de elementos de interface utilizando jQuery e jQuery UI, além de incorporar visualizações de dados com Chart.js.

## Visão Geral do Projeto

Este sistema permite que usuários registrem seus horários de entrada e saída, gerando relatórios detalhados sobre a assiduidade e o total de horas trabalhadas. É uma ferramenta ideal para freelancers, pequenas equipes ou qualquer pessoa que precise de um controle básico e eficiente de sua jornada de trabalho.

## Funcionalidades Principais

*   **Registro de Ponto Simplificado:** Marque sua entrada e saída com facilidade, com a opção de adicionar observações.
*   **Relatórios Detalhados:** Visualize suas horas trabalhadas por dia e por mês.
*   **Gráficos Interativos:**
    *   **Assiduidade:** Gráfico de pizza mostrando a proporção de dias com expediente completo vs. incompleto.
    *   **Horas por Dia:** Gráfico de barras exibindo as horas trabalhadas em cada dia do mês.
    *   **Meta Mensal de Horas:** Gráfico de barras comparando as horas cumpridas com a meta mensal, baseada nos dias úteis configurados.
*   **Gerenciamento de Sub-usuários:** Usuários administradores podem cadastrar e gerenciar sub-usuários, permitindo o controle de ponto para uma equipe.
*   **Login como Sub-usuário:** Administradores podem logar como um sub-usuário sem a necessidade de conhecer a senha, facilitando o suporte e a visualização.
*   **Preferências Personalizáveis:** Configure sua carga horária diária, tempo de almoço e os dias da semana em que você trabalha.
*   **Navegação por Calendário:** Filtre relatórios por mês e dia usando um calendário interativo.
*   **Persistência de Dados:** Todos os dados são armazenados localmente no navegador utilizando `localStorage`, garantindo que suas informações permaneçam acessíveis mesmo após fechar a aplicação.

## Tecnologias Utilizadas

O Ponto Eletrônico é construído com uma combinação de tecnologias web clássicas e modernas para oferecer uma experiência rica e funcional:

*   **HTML5:** Estrutura semântica da aplicação.
*   **CSS3:** Estilização responsiva e moderna, incluindo `reset.css` para consistência entre navegadores.
*   **jQuery (v1.5.1):** Manipulação do DOM, eventos e AJAX (embora a persistência agora seja via `localStorage`).
*   **jQuery UI (v1.8.13):** Componentes de interface de usuário ricos, como diálogos, botões, datepicker e efeitos visuais, proporcionando uma experiência de usuário aprimorada.
*   **Chart.js:** Biblioteca JavaScript para criação de gráficos dinâmicos e responsivos, utilizada para visualizar os dados de horas trabalhadas.
*   **js-sha256:** Biblioteca para hashing de senhas, garantindo uma camada básica de segurança para as credenciais armazenadas localmente.
*   **jQuery Masked Input:** Para formatação de campos de entrada de texto.
*   **Head.js:** Carregador de scripts assíncrono para otimizar o carregamento da página.
*   **`localStorage` (HTML5 Web Storage):** Utilizado para persistir todos os dados da aplicação (usuários, registros de ponto, configurações) diretamente no navegador do usuário, eliminando a necessidade de um backend.

## Requisitos

*   Um navegador web moderno compatível com HTML5 e JavaScript.

## Atenção

Este projeto foi desenvolvido com foco em aprendizado e necessidades pessoais. Embora utilize hashing de senhas para armazenamento local, ele não é projetado para ser uma solução de segurança de nível empresarial ou para lidar com dados sensíveis em um ambiente de produção sem camadas adicionais de segurança e um backend robusto.