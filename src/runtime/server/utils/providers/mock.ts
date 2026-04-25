import type { ReviewProviderAdapter, FetchReviewsOptions, ProviderResult, NormalizedReview } from '../../../types'

const MOCK_REVIEWS: NormalizedReview[] = [
  {
    id: 'mock_1',
    provider: 'mock',
    rating: 5,
    text: 'Harika bir otel deneyimi! Personel son derece ilgiliydi, odalar tertemizdi. Kesinlikle tekrar geleceğiz.',
    title: 'Mükemmel tatil',
    author: { name: 'Ahmet Y.', reviewCount: 8 },
    publishedAt: '2025-03-20T14:30:00Z',
    language: 'tr',
    isVerified: true,
    likes: 12,
    businessResponse: {
      text: 'Değerli misafirimiz, güzel yorumunuz için çok teşekkür ederiz! Sizi tekrar ağırlamaktan mutluluk duyarız.',
      publishedAt: '2025-03-21T09:00:00Z',
    },
  },
  {
    id: 'mock_2',
    provider: 'mock',
    rating: 4,
    text: 'Great location and very clean rooms. The breakfast could be improved but overall a fantastic stay. Staff were friendly and helpful throughout.',
    title: 'Very good experience',
    author: { name: 'Sarah M.', reviewCount: 23 },
    publishedAt: '2025-03-18T10:15:00Z',
    language: 'en',
    isVerified: false,
    likes: 8,
  },
  {
    id: 'mock_3',
    provider: 'mock',
    rating: 5,
    text: 'Séjour absolument parfait ! Le personnel était aux petits soins, la piscine magnifique et le petit-déjeuner copieux. Je reviendrai sans hésiter.',
    title: 'Séjour inoubliable',
    author: { name: 'Marie D.', reviewCount: 17 },
    publishedAt: '2025-03-15T08:20:00Z',
    language: 'fr',
    isVerified: true,
    likes: 9,
    businessResponse: {
      text: 'Merci beaucoup pour votre avis ! Nous espérons vous revoir bientôt.',
      publishedAt: '2025-03-16T11:00:00Z',
    },
  },
  {
    id: 'mock_4',
    provider: 'mock',
    rating: 3,
    text: 'Das Hotel ist gut gelegen, aber der Service könnte besser sein. Das Zimmer war sauber aber etwas klein für den Preis.',
    title: 'Gute Lage, verbesserungswürdiger Service',
    author: { name: 'Hans B.' },
    publishedAt: '2025-03-10T12:00:00Z',
    language: 'de',
    isVerified: false,
    likes: 2,
  },
  {
    id: 'mock_5',
    provider: 'mock',
    rating: 5,
    text: 'Perfect stay! Staff were incredibly helpful and the facilities were top-notch. The rooftop pool has an amazing panoramic view of the city.',
    title: 'Highly recommended',
    author: { name: 'Emma L.', reviewCount: 15 },
    publishedAt: '2025-03-05T16:45:00Z',
    language: 'en',
    isVerified: true,
    likes: 20,
  },
  {
    id: 'mock_6',
    provider: 'mock',
    rating: 2,
    text: 'Beklentilerimin altında kaldı. Oda küçüktü ve dışarıdan gürültü geliyordu. Kahvaltı seçenekleri oldukça sınırlıydı.',
    title: 'Hayal kırıklığı',
    author: { name: 'Fatma S.' },
    publishedAt: '2025-02-28T09:30:00Z',
    language: 'tr',
    isVerified: true,
    likes: 1,
  },
  {
    id: 'mock_7',
    provider: 'mock',
    rating: 4,
    text: 'Excellent value for money. The room was spacious and the bed was incredibly comfortable. The spa was a highlight. Would definitely stay again.',
    author: { name: 'James T.', reviewCount: 6 },
    publishedAt: '2025-02-20T14:00:00Z',
    language: 'en',
    isVerified: true,
    likes: 5,
  },
  {
    id: 'mock_8',
    provider: 'mock',
    rating: 5,
    text: 'Отличный отель! Персонал очень дружелюбный, номера чистые и уютные. Завтрак был просто великолепным. Обязательно вернёмся.',
    title: 'Отличное место',
    author: { name: 'Иван П.', reviewCount: 11 },
    publishedAt: '2025-02-15T08:00:00Z',
    language: 'ru',
    isVerified: true,
    likes: 9,
  },
  {
    id: 'mock_9',
    provider: 'mock',
    rating: 4,
    text: 'Hotel muy bien ubicado, habitaciones amplias y limpias. El servicio del restaurante podría mejorar un poco pero en general una estancia muy agradable.',
    title: 'Muy buena experiencia',
    author: { name: 'Carlos R.', reviewCount: 31 },
    publishedAt: '2025-02-10T11:30:00Z',
    language: 'es',
    isVerified: false,
    likes: 6,
  },
  {
    id: 'mock_10',
    provider: 'mock',
    rating: 5,
    text: 'Struttura fantastica, personale gentilissimo e sempre disponibile. La colazione era abbondante e di ottima qualità. Torneremo sicuramente!',
    title: 'Soggiorno meraviglioso',
    author: { name: 'Giulia M.', reviewCount: 19 },
    publishedAt: '2025-02-05T09:00:00Z',
    language: 'it',
    isVerified: true,
    likes: 14,
    businessResponse: {
      text: 'Grazie mille per il suo commento! La aspettiamo di nuovo presto.',
      publishedAt: '2025-02-06T10:00:00Z',
    },
  },
  {
    id: 'mock_11',
    provider: 'mock',
    rating: 3,
    text: 'ロケーションは最高でしたが、部屋がやや狭く感じました。スタッフの対応は丁寧でしたが、朝食のバリエーションが少なかったです。',
    title: 'まあまあの滞在',
    author: { name: 'Yuki T.', reviewCount: 7 },
    publishedAt: '2025-01-28T07:45:00Z',
    language: 'ja',
    isVerified: false,
    likes: 3,
  },
  {
    id: 'mock_12',
    provider: 'mock',
    rating: 5,
    text: 'Çok güzel bir deneyimdi. Deniz manzaralı oda muhteşemdi, havuz alanı bakımlı ve personel son derece ilgili ve güler yüzlüydü.',
    author: { name: 'Zeynep K.', reviewCount: 4 },
    publishedAt: '2025-01-20T15:00:00Z',
    language: 'tr',
    isVerified: true,
    likes: 11,
  },
]

export const mockProvider: ReviewProviderAdapter = {
  name: 'mock',

  async fetchReviews(
    _config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    let reviews = [...MOCK_REVIEWS]

    if (options?.language) {
      reviews = reviews.filter(r => r.language === options.language)
    }

    if (options?.minRating) {
      reviews = reviews.filter(r => r.rating >= options.minRating!)
    }

    const sort = options?.sort
    if (sort === 'newest' || sort === 'createdat.desc') {
      reviews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    }
    else if (sort === 'highest_rating' || sort === 'ratingHigh') {
      reviews.sort((a, b) => b.rating - a.rating)
    }
    else if (sort === 'lowest_rating' || sort === 'ratingLow') {
      reviews.sort((a, b) => a.rating - b.rating)
    }

    const limit = options?.limit || 50

    return {
      reviews: reviews.slice(0, limit),
      totalAvailable: MOCK_REVIEWS.length,
    }
  },
}
