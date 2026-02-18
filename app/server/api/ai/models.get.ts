import { AVAILABLE_MODELS } from '~/server/utils/ai_models';

export default defineEventHandler((event) => {
    return AVAILABLE_MODELS;
});
