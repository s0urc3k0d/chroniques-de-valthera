import { Campaign, Chapter, Character } from '../types';

const STORAGE_KEY = 'valthera_rpg_data';

const MOCK_DATA: Campaign[] = [
  {
    id: 'c1',
    title: "L'Ombre du Monolithe",
    universe: 'valthera',
    pitch: "Dans les terres désolées de Valthera, une ancienne structure émet une énergie corruptrice. Un groupe d'aventuriers improbables doit enquêter avant que la corruption ne s'étende à la capitale.",
    status: 'active',
    imageUrl: 'https://picsum.photos/id/1033/800/400',
    createdAt: Date.now(),
    characters: [
      {
        id: 'char1',
        name: 'Kaelen',
        species: 'Elfe Stellaire',
        class: 'Mage-Lame',
        description: 'Un guerrier mystique cherchant à racheter son honneur perdu. Il possède une lame ancestrale qui murmure des prophéties oubliées. Banni de sa cité flottante pour avoir étudié les arts interdits du vide.',
        player: 'Thomas',
        imageUrl: 'https://picsum.photos/id/1025/200/200'
      },
      {
        id: 'char2',
        name: 'Brog',
        species: 'Orc des Cendres',
        class: 'Barbare',
        description: 'Il parle peu, il frappe fort, mais il a un cœur d\'or (et aime les chatons). Ancien gladiateur des fosses de lave, il cherche désormais une vie plus paisible, bien que la violence semble toujours le trouver.',
        player: 'Sarah',
        imageUrl: 'https://picsum.photos/id/1005/200/200'
      }
    ],
    chapters: [
      {
        id: 'chap1',
        campaignId: 'c1',
        title: "L'Appel du Néant",
        summary: "Le groupe se rencontre à la taverne du 'Dernier Soupir'. Une bagarre éclate, révélant les pouvoirs de Kaelen. Un mystérieux commanditaire les approche.",
        highlights: ["La bagarre de taverne épique", "Rencontre avec l'homme encapuchonné", "Le vol de la carte"],
        loot: ["50 pièces d'or", "Dague rouillée"],
        sessionDate: '2023-10-01',
        order: 1
      }
    ]
  },
  {
    id: 'c2',
    title: "Cyber-Heist 2099",
    universe: 'hors-univers',
    pitch: "Neo-Tokyo. Une corpo a volé l'âme numérique d'une IA sentiente. Vous êtes les runners engagés pour la récupérer.",
    status: 'completed',
    imageUrl: 'https://picsum.photos/id/1076/800/400',
    createdAt: Date.now() - 10000000,
    characters: [],
    chapters: []
  }
];

export const getCampaigns = (): Campaign[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    return MOCK_DATA;
  }
  return JSON.parse(data);
};

export const saveCampaigns = (campaigns: Campaign[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
};

export const getCampaignById = (id: string): Campaign | undefined => {
  const campaigns = getCampaigns();
  return campaigns.find(c => c.id === id);
};

export const saveCampaign = (campaign: Campaign) => {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaign.id);
  if (index >= 0) {
    campaigns[index] = campaign;
  } else {
    campaigns.push(campaign);
  }
  saveCampaigns(campaigns);
};

export const deleteCampaign = (id: string) => {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  saveCampaigns(filtered);
};

export const deleteChapter = (campaignId: string, chapterId: string) => {
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
  
  if (campaignIndex !== -1) {
    const campaign = campaigns[campaignIndex];
    campaign.chapters = campaign.chapters.filter(c => c.id !== chapterId);
    campaigns[campaignIndex] = campaign;
    saveCampaigns(campaigns);
  }
};