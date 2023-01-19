import { useParams } from 'react-router-dom';
import axios from 'axios';
import articles from './article-content';
import { useState, useEffect } from "react"
import NotPageFound from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';

const ArticlePage = () => {
    const [ articleInfo, setArticleInfo ] = useState({ upvotes: 0, comments: [] });
    const { articleId } = useParams();

    useEffect(() => {
        const loadArticleInfo = async () => {
            const response = await axios.get(`/api/articles/${articleId}`);
            const newArticleInfo = response.data;
            setArticleInfo(newArticleInfo); // changes state
        }

        loadArticleInfo();
    }, [articleId]); // call useEffect only when component is first mounted

    const article = articles.find(article => article.name === articleId);

    const addUpvote = async () => { // should be async, we make a network request to the server
        const response = await axios.put(`/api/articles/${articleId}/upvote`);
        const updatedArticle = response.data;
        setArticleInfo(updatedArticle);
    }

    if (!article) {
        return <NotPageFound />;
    }

    return (
        <>
            <h1>{article.title}</h1>
            <div id='upvotes-section'>
                <button onClick={() => addUpvote()}>Upvote</button>
                <p>This article has {articleInfo.upvotes} upvote(s).</p>
            </div>
            {article.content.map((paragraph, index) => 
                <p key={index}>{paragraph}</p>
            )}
            <AddCommentForm articleName={articleId} onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
            <CommentsList comments={articleInfo.comments} />
        </>
    );
};

export default ArticlePage;