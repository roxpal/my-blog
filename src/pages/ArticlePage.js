import { useParams } from 'react-router-dom';
import articles from './article-content';
import NotPageFound from './NotFoundPage';

const ArticlePage = () => {
    const { articleId } = useParams();
    const article = articles.find(article => article.name === articleId);

    if (!article) {
        return <NotPageFound />;
    }

    return (
        <>
            <h1>{article.title}</h1>
            {article.content.map((paragraph, index) => 
                <p key={index}>{paragraph}</p>
            )}
        </>
    );
};

export default ArticlePage;