import React from 'react';
import ajax from 'superagent';
import ReactPaginate from 'react-paginate';
import { Button, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
import { observer } from 'mobx-react';

import { SourceMode } from '../store';
import './SourceShareList.css';
import baseUrl from './config';

@observer
class SourceShareList extends React.Component{
  constructor(props){
    super(props);

    this.state= {
      sourceList: [],
      offset: 0,
      perPage: 5,
      sourceListLoaded: false,
      sourceMode: "link"
    }
  }

loadSourceFromServer = () => {
  var sourceListUrl = "";
  
  if(SourceMode.mode === "link"){
    sourceListUrl = "urlpublish";
    this.setState({ sourceMode : "link" });
  }else{
    sourceListUrl = "articlelist";
    this.setState({ sourceMode : "article" });
  }
  ajax.get(`${baseUrl}/${sourceListUrl}/`)
  .query({ limit: this.state.perPage, offset: this.state.offset })
  .end((error, response) => {
    if(!error && response){
      this.setState({ sourceList : response.body.results, pageCount: Math.ceil(response.body.count / this.state.perPage) });
      this.setState({ sourceListLoaded: true });
    }else{
      console.log("source list fetching error!");
    }
  });
}

  componentWillMount(){
    setTimeout(this.loadSourceFromServer, 0); //因无法切换list萌生出的非常非常奇怪的方法，暂时无法解释，头痛
  }

  handleUrlreadcountChange(id, count) {
    if(SourceMode.mode === "link"){
      ajax.patch(`${baseUrl}/urlpublish/${id}/`)        
        .send({urlreadcount:++count})
        .end((error, response) => {
          if(!error && response) {
            console.log('success');
          } else {
            console.log('fail');
          }
        })
    }else{
      ajax.patch(`${baseUrl}/articlelist/${id}/`)        
        .send({article_readcount:++count})
        .end((error, response) => {
          if(!error && response) {
            console.log('success');
          } else {
            console.log('fail');
          }
        })
    }
    
  } 

  handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * this.state.perPage);

    this.setState({offset : offset}, () => {
      this.loadSourceFromServer();
    });
  };

  render() {
    if(this.state.sourceListLoaded === true){
      return (
        <div className="source-share-list">
          <h1 className="title-h">资源分享</h1>
          <p className="title-p"><label className="of"></label>来自IT各个领域的学习资源<label className="on"></label></p>
          <div className="source-card-list">
          {
            this.state.sourceList.map((source) => {
              var id = 0;
              var userName = "";
              var userId = 0;
              var urlIntroduce = "";
              var urlPubulishTime = "";
              var urlReadCount = 0;
              var commentLength = 0;
              
              if(this.state.sourceMode === "article"){
                id = source.id;
                userName = source.article_owner;
                userId = source.usernameid;
                urlIntroduce = source.article_abstract;
                urlPubulishTime = source.publish_time.slice(0, 16);
                urlReadCount = source.article_readcount;
                commentLength = source.articlecomment_set.length;
              }else{
                id = source.id;
                userName = source.owner;
                userId = source.username;
                urlIntroduce = source.urlintroduce;
                urlPubulishTime = source.urlpublish_time.slice(0, 16);
                urlReadCount = source.urlreadcount;
                commentLength = source.urlcomment_set.length;
              }

              return (
                  <div className="source-card" key={source.id}>
                    <p>
                      <b className="b-by">BY</b>
                      <b className="b-username"><Link to={`user/${userId}`}>{userName}</Link></b>
                      <b className="b-publishtime">{urlPubulishTime}</b>
                      阅读量：{urlReadCount} &nbsp;&nbsp;
                      评论量：{commentLength}
                    </p>
                    <p>{urlIntroduce}</p>
                    <LinkContainer to={`source/${id}`}>
                      <NavItem>                           {/* 防止<Button> 被自动转换成<a>导致样式混乱 */}
                        <Button bsStyle="danger" onClick={ this.handleUrlreadcountChange.bind(this, id, urlReadCount) }>了解详情</Button>
                      </NavItem>
                    </LinkContainer>
                  </div>
              )
            })
          }</div>
          <ReactPaginate previousLabel={"<"}
                        nextLabel={">"}
                        breakLabel={<a href="">...</a>}
                        breakClassName={"break-me"}
                        pageCount={this.state.pageCount}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick}
                        containerClassName={"pagination"}
                        subContainerClassName={"pages pagination"}
                        activeClassName={"active"} />
        </div>
      )
    }else{
      return null;
    }
  }
}

export default SourceShareList;