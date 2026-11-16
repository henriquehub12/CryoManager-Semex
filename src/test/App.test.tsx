import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '@/App';

describe('Carregamento da aplicação', () => {
  it('renderiza o app sem erros', () => {
    render(<App />);
    expect(screen.getByText('CryoManager')).toBeInTheDocument();
  });

  it('exibe o indicador de ambiente no cabeçalho', () => {
    render(<App />);
    expect(screen.getByText('Ambiente de Demonstração')).toBeInTheDocument();
  });

  it('exibe o painel inicial como tela padrão', () => {
    render(<App />);
    expect(screen.getByText(/Bem-vindo/i)).toBeInTheDocument();
  });
});

describe('Dashboard', () => {
  it('exibe as seções principais de indicadores', () => {
    render(<App />);
    expect(screen.getAllByText('Botijões').length).toBeGreaterThan(0);
    expect(screen.getByText('Testes', { selector: 'h3' })).toBeInTheDocument();
  });

  it('exibe os cards de status de botijões', () => {
    render(<App />);
    expect(screen.getByText('Aptos')).toBeInTheDocument();
    expect(screen.getByText('Não Aptos')).toBeInTheDocument();
    expect(screen.getByText('Em Teste')).toBeInTheDocument();
  });

  it('exibe medições previstas e notificações recentes', () => {
    render(<App />);
    expect(screen.getByText('Medições Previstas para Hoje')).toBeInTheDocument();
    expect(screen.getByText('Notificações Recentes')).toBeInTheDocument();
  });
});

describe('Navegação entre telas', () => {
  it('navega para a tela de Botijões', async () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    await within(nav).getByRole('button', { name: 'Botijões' }).click();
    expect(await screen.findByText('Botijões Criogênicos')).toBeInTheDocument();
  });

  it('navega para a tela de Testes', async () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    await within(nav).getByRole('button', { name: 'Testes' }).click();
    expect(await screen.findByText('Controle de Testes e Qualidade')).toBeInTheDocument();
  });

  it('navega para a tela de Histórico', async () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    await within(nav).getByRole('button', { name: 'Histórico' }).click();
    expect(await screen.findByText('Histórico Completo')).toBeInTheDocument();
  });
});
