const moment = require('moment');
const { Component, Fragment } = require('inferno');
const Share = require('./share');
const Donates = require('./donates');
const Comment = require('./comment');
const crypto = require('crypto');
const RecommendPosts = require('../widget/recommend_post');


/**
 * Get the word count of text.
 */
function getWordCount(content) {
    content = content.replace(/<\/?[a-z][^>]*>/gi, '');
    content = content.trim();
    return content ? (content.match(/[\u00ff-\uffff]|[a-zA-Z]+/g) || []).length : 0;
}

module.exports = class extends Component {
    render() {

        const { config, helper, page, index, site } = this.props;
        const { article, plugins,comment } = config;
        const { has_thumbnail, get_thumbnail, url_for, date, date_xml, __, _p } = helper;

        const language = page.lang || page.language || config.language || 'en';

        const isGitalk = comment.type != 'undefined' && comment.type == 'gitalk';

        const id = crypto.createHash('md5').update(helper.get_path_end_str(page.path,page.uniqueId,page.title)).digest('hex');


        return <Fragment>
            {/*{console.log(index+","+count)}*/}
            {/* First page add hot recommend*/}
            {/*{ index && isGitalk ? <Widget helper={helper} type={'hot_recommend'} config={config} page={page}/> : null}*/}
            {/* Main content */}
            <div class="card">
                {/* Thumbnail */}
                {has_thumbnail(page) ? <div class="card-image">
                    {index ? <a href={url_for(page.link || page.path)} class="image is-7by3">
                        <img class="thumbnail" src={get_thumbnail(page)} alt={page.title || get_thumbnail(page)} />
                    </a> : <span class="image is-7by3">
                        <img class="thumbnail" src={get_thumbnail(page)} alt={page.title || get_thumbnail(page)} />
                    </span>}
                </div> : null}
                {/* Metadata */}
                <article class={`card-content article${'direction' in page ? ' ' + page.direction : ''}`} role="article">
                    {page.layout !== 'page' ? <div class="article-meta size-small is-uppercase level is-mobile">
                        <div class="level-left">
                            {/*置顶图标*/}
                            {page.top > 0 ?
                            <div class="level-item tag is-danger" style="background-color: #3273dc;">已置顶</div>:null}
                            {/* Date */}
                            <time class="level-item" dateTime={date_xml(page.date)}>{date(page.date)}</time>

                            {comment.type !== 'undefined' && comment.type == 'gitalk' ?
                                <a class="commentCountImg" href={`${url_for(page.link || page.path)}#comment-container`}><span class="display-none-class">{id}</span><img class="not-gallery-item" src={`${url_for('https://hexo-blog-wasim.oss-cn-shenzhen.aliyuncs.com/chat.svg')}`}/>&nbsp;<span class="commentCount" id={id}>&nbsp;0</span>&nbsp;&nbsp;&nbsp;&nbsp;</a> : null}
                            {/* Categories */}
                            {page.categories && page.categories.length ? <span class="level-item">
                                {(() => {
                                    const categories = [];
                                    categories.push(<i class="fas fa-folder-open has-text-grey">&nbsp;</i>)
                                    page.categories.forEach((category, i) => {
                                        categories.push(<a class="link-muted" href={url_for(category.path)}>{category.name}</a>);
                                        if (i < page.categories.length - 1) {
                                            categories.push(<span>&nbsp;/&nbsp;</span>);
                                        }
                                    });
                                    return categories;
                                })()}
                            </span> : null}
                            {/* Read time */}
                            {article && article.readtime && article.readtime === true ? <span class="level-item">
                                {(() => {
                                    const words = getWordCount(page._content);
                                    const time = moment.duration((words / 150.0) * 60, 'seconds');
                                    return `${time.locale(language).humanize()} ${__('article.read')} (${__('article.about')} ${words} ${__('article.words')})`;
                                })()}
                            </span> : null}
                            {/* Visitor counter */}
                            {!index && plugins && plugins.busuanzi === true ? <span class="level-item" id="busuanzi_container_page_pv" dangerouslySetInnerHTML={{
                                __html: '<i class="far fa-eye"></i>' + _p('plugin.visit', '&nbsp;&nbsp;<span id="busuanzi_value_page_pv">0</span>')
                            }}></span> : null}
                        </div>
                    </div> : null}
                    {/* Title */}
                    <h1 class="title is-3 is-size-4-mobile">
                        {index ? <a class="link-muted" href={url_for(page.link || page.path)}>{page.title}</a> : page.title}
                    </h1>
                    {/* Content/Excerpt */}
                    <div class="content" dangerouslySetInnerHTML={{ __html: index && page.excerpt ? page.excerpt : page.content }}></div>
                    {/* Tags */}
                    {!index && page.tags && page.tags.length ? <div class="article-tags size-small is-uppercase mb-4">
                        <i class="fas fa-tags has-text-grey"></i>&nbsp;
                        {page.tags.map(tag => {
                            return <a class="link-muted mr-2" rel="tag" href={url_for(tag.path)}>{tag.name}</a>;
                        })}
                    </div> : null}
                    {/* "Read more" button */}
                    {index && page.excerpt ?
                        <div class="level is-mobile is-flex">
                            {page.tags && page.tags.length ?
                                <div class="level-start">
                                    <div class="is-uppercase article-more button is-small size-small">
                                        <i class="fas fa-tags has-text-grey"></i>&nbsp;
                                        {page.tags.map(tag => {
                                            return <a class="link-muted mr-2" rel="tag"
                                                      href={url_for(tag.path)}>{tag.name}</a>;
                                        })}
                                    </div>
                                </div> : null}
                          
                            <div class="level-start">
                                <div class="level-item">
                                    <a class="article-more button is-small size-small link-muted"
                                       href={`${url_for(page.path)}#more`}><i class="fas fa-book-reader has-text-grey">&nbsp;</i>{__('article.more')}>></a>
                                </div>
                            </div>
                        </div> : null}
                    {/*copyright*/}
                    {!index && page.layout == 'post' ?
                    <ul class="post-copyright">
                        <li><strong>本文标题：</strong><a href={url_for(page.permalink)}>{page.title}</a></li>
                        <li><strong>本文作者：</strong><a href={url_for(config.url)}>{config.author}</a></li>
                        <li><strong>本文链接：</strong><a href={url_for(page.permalink)}>{config.url+'/'+page.path}</a></li>
                        <li><strong>版权声明：</strong>本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" rel="external nofollow" target="_blank">CC BY-NC-SA 4.0</a> 许可协议。转载请注明出处！
                        </li>
                    </ul>:null}
                    {!index && page.layout == 'post' ? <RecommendPosts config={config} page={page} helper={helper} site={site}/>:null}
                    {/* Share button */}
                    {!index ? <Share config={config} page={page} helper={helper} /> : null}
                </article>
            </div>
            {/* Donate button */}
            {!index ? <Donates config={config} helper={helper} /> : null}
            {/* Post navigation */}
            {!index && (page.prev || page.next) ? <nav class="post-navigation mt-4 level is-mobile">
                {page.prev ? <div class="level-start">
                    <a class={`article-nav-prev level level-item${!page.prev ? ' is-hidden-mobile' : ''} link-muted`} href={url_for(page.prev.path)}>
                        <i class="level-item fas fa-chevron-left"></i>
                        <span class="level-item">{page.prev.title}</span>
                    </a>
                </div> : null}
                {page.next ? <div class="level-end">
                    <a class={`article-nav-next level level-item${!page.next ? ' is-hidden-mobile' : ''} link-muted`} href={url_for(page.next.path)}>
                        <span class="level-item">{page.next.title}</span>
                        <i class="level-item fas fa-chevron-right"></i>
                    </a>
                </div> : null}
            </nav> : null}
            {/* Comment */}
            {!index ? <Comment config={config} page={page} helper={helper} /> : null}
        </Fragment>;
    }
};
