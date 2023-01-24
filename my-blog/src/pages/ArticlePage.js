import { useParams } from 'react-router-dom';
import axios from 'axios';
import articles from './article-content';
import { useState, useEffect } from "react";
import NotPageFound from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';
import useUser from '../hooks/useUser';

const ArticlePage = () => {
    const [ articleInfo, setArticleInfo ] = useState({ upvotes: 0, comments: [], canUpvote: false });
    const { canUpvote } = articleInfo;
    const { articleId } = useParams();

    const { user, isLoading } = useUser();

    useEffect(() => {
        const loadArticleInfo = async () => {
            const token = user && await user.getIdToken();
            const headers = token ? {authtoken: token } : {};
            const response = await axios.get(`/api/articles/${articleId}`, {headers});
            const newArticleInfo = response.data;
            setArticleInfo(newArticleInfo); // changes state
        }

        if (!isLoading) {
            loadArticleInfo();
        }
    }, [articleId, user, isLoading]); // call useEffect only when component is first mounted

    const article = articles.find(article => article.name === articleId);

    const addUpvote = async () => { // should be async, we make a network request to the server
        const token = user && await user.getIdToken();
        const headers = token ? {authtoken: token } : {};

        const response = await axios.put(`/api/articles/${articleId}/upvote`, null, {headers});
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
                {user
                    ? <button onClick={() => addUpvote()}>{canUpvote ? "Upvote" : "Already Upvoted"}</button>
                    : <button>Log in to upvote</button>}
                <p>This article has {articleInfo.upvotes} upvote(s).</p>
            </div>
            {article.content.map((paragraph, index) => 
                <p key={index}>{paragraph}</p>
            )}
            {user 
                ? <AddCommentForm
                    articleName={articleId}
                    onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
                : <button>Log in to add a comment</button>}
            <CommentsList comments={articleInfo.comments} />
        </>
    );
};

export default ArticlePage;