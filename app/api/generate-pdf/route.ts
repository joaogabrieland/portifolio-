import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { proposalId, projectTitle } = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId é obrigatório' },
        { status: 400 }
      );
    }

    // Construir a URL da proposta
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const proposalUrl = `${baseUrl}/proposta/${proposalId}`;

    // Inicializar Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Para evitar problemas de memória
      ],
    });

    const page = await browser.createPage();

    // Definir viewport
    await page.setViewport({
      width: 1280,
      height: 720,
    });

    // Navegar para a página
    await page.goto(proposalUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Esperar o conteúdo da proposta carregar
    await page.waitForSelector('#proposal-content', { timeout: 10000 });

    // Injetar CSS para otimizar para PDF
    await page.addStyleTag({
      content: `
        body {
          margin: 0;
          padding: 0;
          background: white !important;
          color: black !important;
        }

        #proposal-content {
          background: white !important;
          color: black !important;
        }

        /* Ocultar botões e controles */
        div:has(> button) {
          display: none !important;
        }

        .print\\:hidden {
          display: none !important;
        }

        .print\\:block {
          display: block !important;
        }

        /* Melhorar quebras de página */
        div[class*="rounded-2xl"] {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Remover cores de fundo problemáticas */
        [class*="bg-gradient"] {
          background: white !important;
        }

        [class*="bg-zinc"] {
          background: white !important;
        }

        [class*="bg-indigo"],
        [class*="bg-violet"] {
          background: #f3f4f6 !important;
          color: black !important;
        }

        /* Ajustar texto */
        [class*="text-white"] {
          color: black !important;
        }

        [class*="text-white/"] {
          color: #666 !important;
        }

        /* Bordas */
        [class*="border-white"] {
          border-color: #ddd !important;
        }

        /* Espaçamento para PDF */
        div[class*="space-y"] > * {
          margin-bottom: 1rem !important;
        }
      `,
    });

    // Gerar PDF com controle de paginação
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; text-align: center; font-size: 10px; color: #999; padding: 0 10mm;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    // Fechar o browser
    await browser.close();
    browser = null;

    // Preparar resposta com o PDF
    const fileName = projectTitle
      ? `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      : `proposta-${proposalId}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);

    return NextResponse.json(
      {
        error: 'Erro ao gerar PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  } finally {
    // Garantir que o browser seja fechado
    if (browser) {
      await browser.close();
    }
  }
}
