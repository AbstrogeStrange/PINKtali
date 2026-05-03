import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

const ES_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

class SearchService {
  public client: Client | null = null;

  constructor() {
    try {
      this.client = new Client({ node: ES_URL });
      logger.info('Elasticsearch client initialized');
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch client. Falling back to DB queries.', error);
    }
  }

  async searchVideos(query: string, limit: number, skip: number) {
    if (!this.client) throw new Error('Elasticsearch not available');
    
    const result = await this.client.search({
      index: 'streamverse-videos',
      body: {
        from: skip,
        size: limit,
        query: {
          function_score: {
            query: {
              multi_match: {
                query,
                fields: ['title^3', 'description^1', 'tags^2'],
                fuzziness: 'AUTO'
              }
            },
            field_value_factor: {
              field: 'viewCount',
              modifier: 'log1p',
              factor: 0.1,
              missing: 1
            },
            boost_mode: 'multiply'
          }
        }
      }
    });
    
    return result.hits.hits.map((hit: any) => hit._source);
  }

  async getSuggestions(query: string) {
    if (!this.client) throw new Error('Elasticsearch not available');

    // In a real env, this uses a completion suggester
    // We mock it as a simple match phrase prefix for now
    const result = await this.client.search({
      index: 'streamverse-videos',
      body: {
        size: 10,
        query: {
          match_phrase_prefix: {
            title: query
          }
        },
        _source: ['title']
      }
    });

    return result.hits.hits.map((hit: any) => hit._source.title);
  }
}

export const searchService = new SearchService();
