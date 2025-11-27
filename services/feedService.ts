import { Campaign, Chapter } from '../types';

const SITE_TITLE = 'Chroniques de Valthera';
const SITE_DESCRIPTION = 'Explorez les chroniques épiques de nos campagnes de jeu de rôle dans l\'univers de Valthera et au-delà.';

/**
 * Génère un flux RSS pour les dernières sessions
 */
export const generateRSSFeed = (campaigns: Campaign[], baseUrl: string): string => {
  // Collecter tous les chapitres avec leur campagne
  const allChapters: { chapter: Chapter; campaign: Campaign }[] = [];
  
  campaigns.forEach(campaign => {
    campaign.chapters.forEach(chapter => {
      allChapters.push({ chapter, campaign });
    });
  });

  // Trier par date de session (plus récent en premier)
  allChapters.sort((a, b) => 
    new Date(b.chapter.sessionDate).getTime() - new Date(a.chapter.sessionDate).getTime()
  );

  // Limiter aux 50 dernières sessions
  const recentChapters = allChapters.slice(0, 50);

  const lastBuildDate = recentChapters.length > 0 
    ? new Date(recentChapters[0].chapter.sessionDate).toUTCString()
    : new Date().toUTCString();

  const items = recentChapters.map(({ chapter, campaign }) => {
    const pubDate = new Date(chapter.sessionDate).toUTCString();
    const link = `${baseUrl}/campagne/${campaign.id}#chapitre-${chapter.id}`;
    const description = escapeXml(chapter.summary.replace(/[#*_]/g, '').slice(0, 500));
    const title = escapeXml(`${campaign.title} - ${chapter.title}`);
    const highlights = chapter.highlights.length > 0 
      ? `<p><strong>Moments forts:</strong></p><ul>${chapter.highlights.map(h => `<li>${escapeXml(h)}</li>`).join('')}</ul>`
      : '';

    return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}${highlights}]]></description>
      <category>${escapeXml(campaign.universe === 'valthera' ? 'Valthera' : 'Hors-Série')}</category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${baseUrl}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>fr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>${SITE_TITLE}</title>
      <link>${baseUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`;
};

/**
 * Génère un PDF HTML pour une campagne (rendu côté client puis print)
 */
export const generateCampaignPDFContent = (campaign: Campaign): string => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusLabels = {
    active: 'En cours',
    completed: 'Terminée',
    hiatus: 'En pause',
  };

  const charactersHtml = campaign.characters.map(char => `
    <div class="character">
      ${char.imageUrl ? `<img src="${char.imageUrl}" alt="${char.name}" class="character-image"/>` : ''}
      <div class="character-info">
        <h4>${escapeHtml(char.name)}</h4>
        <p class="character-details">${escapeHtml(char.species)} ${escapeHtml(char.class)}</p>
        <p class="character-player">Joué par: ${escapeHtml(char.player)}</p>
        ${char.description ? `<p class="character-desc">${escapeHtml(char.description)}</p>` : ''}
      </div>
    </div>
  `).join('');

  const sortedChapters = [...campaign.chapters].sort((a, b) => a.order - b.order);
  
  const chaptersHtml = sortedChapters.map(chapter => `
    <div class="chapter">
      <div class="chapter-header">
        <h3>Session ${chapter.order}: ${escapeHtml(chapter.title)}</h3>
        <span class="chapter-date">${formatDate(chapter.sessionDate)}</span>
      </div>
      <div class="chapter-summary">
        ${parseMarkdownToHtml(chapter.summary)}
      </div>
      ${chapter.highlights.length > 0 ? `
        <div class="chapter-highlights">
          <h4>📌 Moments forts</h4>
          <ul>
            ${chapter.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${chapter.loot && chapter.loot.length > 0 ? `
        <div class="chapter-loot">
          <h4>💎 Butin récupéré</h4>
          <ul>
            ${chapter.loot.map(l => `<li>${escapeHtml(l)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(campaign.title)} - Chroniques de Valthera</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', serif;
      color: #1a1a2e;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3, h4 {
      font-family: 'Times New Roman', serif;
      color: #0f766e;
      margin-top: 1.5em;
    }
    
    h1 {
      font-size: 2.5em;
      text-align: center;
      border-bottom: 3px double #0f766e;
      padding-bottom: 0.5em;
      margin-bottom: 0.5em;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      font-style: italic;
      margin-bottom: 2em;
    }
    
    .cover-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 1em;
    }
    
    .metadata {
      display: flex;
      justify-content: center;
      gap: 2em;
      margin-bottom: 2em;
      padding: 1em;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .metadata-item {
      text-align: center;
    }
    
    .metadata-label {
      font-size: 0.8em;
      color: #666;
      text-transform: uppercase;
    }
    
    .metadata-value {
      font-weight: bold;
      color: #0f766e;
    }
    
    .pitch {
      font-size: 1.1em;
      font-style: italic;
      padding: 1em;
      border-left: 4px solid #0f766e;
      background: #f9f9f9;
      margin: 2em 0;
    }
    
    .section {
      page-break-inside: avoid;
      margin: 2em 0;
    }
    
    .characters-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1em;
    }
    
    .character {
      display: flex;
      gap: 1em;
      padding: 1em;
      background: #f9f9f9;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .character-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .character-info h4 {
      margin: 0;
      font-size: 1.1em;
    }
    
    .character-details {
      color: #666;
      font-size: 0.9em;
      margin: 0.2em 0;
    }
    
    .character-player {
      font-size: 0.8em;
      color: #0f766e;
    }
    
    .character-desc {
      font-size: 0.85em;
      color: #444;
      margin-top: 0.5em;
    }
    
    .chapter {
      margin: 2em 0;
      padding: 1.5em;
      border: 1px solid #ddd;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .chapter-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5em;
      margin-bottom: 1em;
    }
    
    .chapter-header h3 {
      margin: 0;
    }
    
    .chapter-date {
      color: #666;
      font-size: 0.9em;
    }
    
    .chapter-summary {
      margin-bottom: 1em;
    }
    
    .chapter-highlights, .chapter-loot {
      background: #f5f9f9;
      padding: 1em;
      border-radius: 4px;
      margin-top: 1em;
    }
    
    .chapter-highlights h4, .chapter-loot h4 {
      margin: 0 0 0.5em 0;
      font-size: 1em;
      color: #0f766e;
    }
    
    .chapter-highlights ul, .chapter-loot ul {
      margin: 0;
      padding-left: 1.5em;
    }
    
    .chapter-highlights li, .chapter-loot li {
      margin: 0.3em 0;
    }
    
    .footer {
      margin-top: 4em;
      text-align: center;
      color: #999;
      font-size: 0.8em;
      border-top: 1px solid #eee;
      padding-top: 1em;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .chapter {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${campaign.imageUrl ? `<img src="${campaign.imageUrl}" alt="${escapeHtml(campaign.title)}" class="cover-image"/>` : ''}
  
  <h1>${escapeHtml(campaign.title)}</h1>
  <p class="subtitle">${campaign.universe === 'valthera' ? 'Chroniques de Valthera' : 'Hors-Série'}</p>
  
  <div class="metadata">
    <div class="metadata-item">
      <div class="metadata-label">Statut</div>
      <div class="metadata-value">${statusLabels[campaign.status]}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Sessions</div>
      <div class="metadata-value">${campaign.chapters.length}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Personnages</div>
      <div class="metadata-value">${campaign.characters.length}</div>
    </div>
  </div>
  
  <div class="pitch">${escapeHtml(campaign.pitch)}</div>
  
  <div class="section">
    <h2>🎭 Les Aventuriers</h2>
    <div class="characters-grid">
      ${charactersHtml}
    </div>
  </div>
  
  <div class="section">
    <h2>📖 Journal de Campagne</h2>
    ${chaptersHtml}
  </div>
  
  <div class="footer">
    <p>Généré depuis Chroniques de Valthera</p>
    <p>${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;
};

/**
 * Ouvre le contenu PDF dans une nouvelle fenêtre pour impression
 */
export const printCampaignPDF = (campaign: Campaign): void => {
  const htmlContent = generateCampaignPDFContent(campaign);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre le chargement des images avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};

// Helpers
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdownToHtml(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>');
}
