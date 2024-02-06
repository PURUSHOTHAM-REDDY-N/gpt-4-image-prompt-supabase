"use client";

import { React, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ImageUploading from "react-images-uploading";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactLoading from 'react-loading';


export default function main() {
  const [images, setImages] = useState([]);
  const maxNumber = 69;
  const abortControllerRef = useRef(null);
  const [assisnantResponse1, setAssistantResponse1] = useState("");
  const [assisnantResponse2, setAssistantResponse2] = useState("");
  const [showLoading, setshowLoading] = useState(false)
  const router = useRouter();
  const supabase = createClientComponentClient();


  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList);
    // console.log(imageList[0].image_url);
    setImages(imageList);
  };

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
      if (!user) {
        router.replace("/");
      }
    }

    getUser();
    getPrompts()
  }, []);

  const getPrompts =async ()=>{
    let { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", 1)
      .single();
      localStorage.setItem("prompts",JSON.stringify(data))    
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const submitPrompt1=async(image)=>{
    setAssistantResponse1("");
    const content = [
      {
        type: "image_url",
        image_url: {
          url: image[0].data_url,
        },
      },
      {
        type: "text",
        text: JSON.parse(localStorage.getItem("prompts")).prompt1,
      },
    ];
    abortControllerRef.current = new AbortController();
    const res = await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortControllerRef.current.signal,
    });
    if (!res.ok || !res.body) {
      alert("Error sending message");
      return;
    }
    const reader = res.body.getReader();
    setshowLoading(false)

    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();

      const text = decoder.decode(value);
      console.log(text);
      setAssistantResponse1((currentValue) => currentValue + text);

      if (done) {
        break;
      }
    }
  }

  const submitPrompt2 = async(image)=>{
    setAssistantResponse2("");
    const content = [
      {
        type: "image_url",
        image_url: {
          url: image[0].data_url,
        },
      },
      {
        type: "text",
        text: JSON.parse(localStorage.getItem("prompts")).prompt2,
      },
    ];
    abortControllerRef.current = new AbortController();
    const res = await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortControllerRef.current.signal,
    });
    if (!res.ok || !res.body) {
      alert("Error sending message");
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();

      const text = decoder.decode(value);
      console.log(text);
      setAssistantResponse2((currentValue) => currentValue + text);

      if (done) {
        break;
      }
    }
  }
  const handleSubmit = async (image, text) => {
    setshowLoading(true)
    await submitPrompt1(image);
    await submitPrompt2(image)
  };
  return (
    <>
      {/* <button onClick={() => getPrompts()}>krnfjenjrgn</button> */}
      <main className="flex items-center flex-col justify-center bg-gray-800 p-6">
        <br />
        <div className="flex items-center">
          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              // write your building UI
              <div className="upload__image-wrapper">
                &nbsp;
                {/* <button className='rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none' onClick={onImageRemoveAll}>Remove all images</button> */}
                {imageList.map((image, index) => (
                  <div key={index} className="image-item">
                    <button
                      style={{ height: "20px", width: "20px" }}
                      className="relative top-2 left-20 rounded-full bg-white text-black font-bold"
                      onClick={() => onImageRemove(index)}
                    >
                      X
                    </button>
                    <img src={image["data_url"]} alt="" width="100" />

                    <div className="image-item__btn-wrapper">
                      {/* <button onClick={() => onImageUpdate(index)}>Update</button> */}

                      {/* <button
                        className="rounded-md p-2 m-4 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                        onClick={() => onImageRemove(index)}
                      >
                        Remove
                      </button> */}
                    </div>
                  </div>
                ))}
                <button
                  className="rounded-md p-4 m-4 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  Click or Drop here
                </button>
              </div>
            )}
          </ImageUploading>
        </div>
        <button
          disabled={!images.length}
          style={!images.length ? { opacity: 0.5 } : { opacity: 1 }}
          className="w-full sm:w-1/3 rounded-md p-4 m-4 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
          onClick={() =>
            handleSubmit(
              images,
              "Give feedback for this photo as a photo to be used on online dating platform like tinder or bumbly. Give actionable advice as well."
            )
          }
        >
          Submit
        </button>
        <button className='w-full sm:w-1/3 rounded-md p-4 m-4 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none' onClick={handleLogout}>logout</button>

      </main>
      
      {showLoading?<><div className="flex flex-col items-center justify-center"><ReactLoading type={"balls"} color={"#ffffff"} height={100} width={50} /></div></>:''
            }
      {assisnantResponse1 ? (
        <>
          <div className="flex-row sm:flex-col px-10 py-10">
            <div className="font-extrabold mb-3 mt-10 text-2xl">
              General feedback
            </div>
            
            <Markdown remarkPlugins={[remarkGfm]}>
              {assisnantResponse1}
            </Markdown>
            <div className="font-extrabold mb-3 mt-10 text-2xl">
              First Picture Worthy?
            </div>
            <Markdown remarkPlugins={[remarkGfm]}>
              {assisnantResponse2?assisnantResponse2:'fetching.....'}
              {/* {assisnantResponse2} */}
            </Markdown>
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
}
