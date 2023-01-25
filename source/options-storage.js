import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
    defaults: {
        full_layout: true,
        max_video_quality: true,
        theater_mode: true
    },
    migrations: [
        OptionsSync.migrations.removeUnused,
    ],
    logging: true,
});