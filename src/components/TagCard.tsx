import type { Tag } from "../types/Tag";
import { Navigate, useNavigate } from "react-router-dom";

interface Props{
    tag: Tag;
}

function TagCard({tag}: Props){
  const navigate = useNavigate();
    return (
    <div className="tag-card">
       <button
       key={tag.id}
       className="tag-pill clickable"
       onClick={()=> navigate(`/?tag=${tag.id}`)}>
        {tag.name}
       </button>
       
    </div>
  );
}

export default TagCard;
