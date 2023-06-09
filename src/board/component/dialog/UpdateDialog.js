import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form } from "react-bootstrap";

const UpdateDialog = ({setShowCheckPwdForUpdate, setOpen, no}) => {

    const [showUpdateDialog, setShowUpdateDialog] = useState(true);
    const [postInfo, setPostInfo] = useState({});

    const getPostInfo = () => {
        axios.get('/board/post/' + no)
        .then((response) => {
            setPostInfo(response.data);
        })
    }

    useEffect(() => {
        setShowCheckPwdForUpdate(false); // 마운트 되면 비밀번호 체크 모달 닫기 
        getPostInfo();
    }, [])

    const closeDialog = () => {
        setOpen(false); // 초기화
    };

    const [file, setFile] = useState();

    // 파일 미리보기 토글
    const [isShowPreviewFile, setIsShowPreviewFile] = useState(true); 

    // 파일 수정 폼 토글
    const [isShowUpdateFileForm, setIsShowUpdateFileForm] = useState(false);
    
    // 게시글 수정
    const updatePost = () => {

        if(postInfo.subject !== '' && postInfo.content !== '') { // 지우고 새로 입력했으나 공백 없는 경우 통과
            const formData = new FormData(); // FormData 객체 생성

            if(file !== undefined && file.name !== '') { // 새로운 파일 업로드한 경우

                // 1. 기존 파일 제거or수정하고 새로운 파일 업로드한 경우
                    // 각 상황에 맞게 서버에 상태를 전달하여 그 값에 따라 서버단에서 로컬 파일 수정 및 삭제하기.                
                // 2. 기존 파일 없는 상태에서 새로운 파일 업로드한 경우
                    // 이건 서버에 상태 전달할 필요 없이 바로 업로드
                
                formData.append("originFile", file); // 서버에 파일 저장 위해 파일 자체도 보내주기

                setPostInfo({
                    ...postInfo,

                    // 새 파일 업로드이므로 file만 보내주면 백단에서 나머지 파일 컬럼 값 설정 
                    originFile: file.name 
                })

                formData.append("post", new Blob([JSON.stringify(postInfo)], {type: "application/json"})); 

            } else { // 새로운 파일 업로드하지 않은 경우 
                if(postInfo.originFile === undefined) { // 1. 기존 파일 삭제한 경우 
                    setPostInfo({ 
                        ...postInfo,

                        // 파일 관련 컬럼은 update 쿼리 실행까지는 되도록 null이라도 보내주기
                        originFile: null,
                        saveFileDir: null,
                        saveFileName: null
                    })
                } else { // 2. 기존 파일 그대로 두고 수정한 경우
                    setPostInfo({
                        ...postInfo, 

                        originFile: postInfo.file,
                        saveFileDir: postInfo.saveFileDir,
                        saveFileName: postInfo.saveFileName
                    })
                }
                formData.append("post", new Blob([JSON.stringify(postInfo)], {type: "application/json"})); 
            }

            axios({
                method: 'put',
                url: '/board/post/' + no,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                } 
            })
            .then((response) => {
                if(response.data === true) {
                    closeDialog();
                    alert('수정되었습니다.');
                } else {
                    alert('수정에 실패하였습니다.');
                }
            }); 
        } else { // 공백 있는 경우
            alert('모든 입력사항을 빠짐없이 입력해주세요.');
            return false;
        }
    }

    return (
        <div>
            <Modal show={showUpdateDialog} onHide={closeDialog}> 
                <Modal.Header closeButton onClick={closeDialog}>
                    <Modal.Title>게시글 수정</Modal.Title>
                </Modal.Header>
    
                <Modal.Body>
                    제목
                    <Form.Control type="text" placeholder="제목을 입력해주세요." 
                        defaultValue={postInfo.subject}
                        value={postInfo.subject} 
                        onChange={(e) => {
                            setPostInfo({ ...postInfo, subject: e.target.value});
                        }}
                        autoFocus
                    /><br></br>
                        
                    내용
                    <Form.Control as="textarea" placeholder="내용을 입력해주세요." 
                        defaultValue={postInfo.content} rows={5}
                        onChange={(e) => {
                            setPostInfo({ ...postInfo, content: e.target.value});
                        }}
                    /><br></br>

                    {/* 기존 첨부파일 있다면 미리보기 + 버튼 누르면 업로드 폼 나오게끔해서 수정할 수 있도록 하기 */}
                    첨부파일
                    <br></br>
                    {/* 2. 첨부파일 없는 경우 */}
                    {
                        postInfo.saveFileDir == null && 
                        <label>[첨부파일이 없습니다]</label>
                    }
                    
                    {/* 파일 추가하기 버튼 */}
                    {
                        postInfo.saveFileDir == null && 
                        <Button className="uploadFileBtn" onClick={() => {
                            setIsShowUpdateFileForm(true);
                        }}>
                            파일업로드
                        </Button>
                    }

                    {/* 1. 첨부파일 있는 경우 */}
                    {
                        postInfo.saveFileDir != null && 
                        isShowPreviewFile &&
                        <img src={postInfo.saveFileDir} className="uploadFile" alt="파일을 불러오는 데 실패하였습니다."></img>
                    }
                    <br></br>
                    {
                        postInfo.saveFileDir != null && 
                        <Button className="updateFileBtn" onClick={() => {
                            setIsShowUpdateFileForm(true);    
                        }}>
                            파일수정
                        </Button>
                    }

                    &nbsp;

                    {
                        postInfo.saveFileDir != null
                        && 
                        <Button className="deleteFileBtn" onClick={() => {
                            setIsShowPreviewFile(false); // 파일 미리보기 폼 닫기

                            setPostInfo({
                                ...postInfo, 

                                // 파일지우기이므로 파일 관련 컬럼은 null로 set 
                                originFile: null,
                                saveFileDir: null,
                                saveFileName: null
                            });
                        }}>
                            파일지우기
                        </Button>
                    }

                    {/* 파일수정 버튼 클릭 시 파일 업로드 폼 뜨게 */}
                    {
                        isShowUpdateFileForm && 
                        <Form.Group controlId="formFileSm" className="mb-3">
                        <Form.Label>파일 업로드</Form.Label>
                        <Form.Control 
                            type="file" size="sm"
                            onChange={(e) => {
                                setFile(e.target.files[0]);
                            }}/>
                        </Form.Group>
                    }


                </Modal.Body>
    
                <Modal.Footer>
                    <Button className="cancleBtn" onClick={closeDialog}>
                        취소
                    </Button>
                    <Button className="updateBtn" onClick={() => {
                        updatePost();
                    }}>
                        수정
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default UpdateDialog;