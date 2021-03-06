import dashboard from './dashboard'

/**
 * insert image
 * Created by peak on 16/8/18.
 */
export default {
    name: 'image',
    icon: 'fa fa-file-image-o',
    i18n: 'image',
    config: {
        // server: null,
        // fieldName: 'image',
        // compress: true,
        // width: 1600,
        // height: 1600,
        // quality: 80,
        sizeLimit: 5 * 1024 * 1024, // 5M
        // upload: {
        //     url: null,
        //     headers: {},
        //     params: {},
        //     fieldName: {}
        // },
        compress: {
            width: 1600,
            height: 1600,
            quality: 80
        },
        uploadHandler(responseText) {
            const json = JSON.parse(responseText)
            return json.url ? json.url : null
        }
    },
    dashboard
}