import { useEffect, useState } from "react";
import type { Video } from "../types/Video";
import { getAllVideos } from "../api/VideoApi";
import VideoCard from "../components/VideoCard";

function videoListPage(){
    const [videos, setVideos] = useState<Video[]>([]);

    useEffect(()=>{
        fetchVideos();
    }, []);

    const fetchVideos = async ()=> {
        try{
            const data = await getAllVideos();
            setVideos(data);
        }catch(error){
            console.error("Error cargando videos", error);
        }
    }


return (
    <div className="page-container">
        <h1>Videos</h1>
        <div className="video-grid">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
    </div>
);
}

export default videoListPage;