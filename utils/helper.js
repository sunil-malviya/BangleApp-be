export const getFullImagePath = (filenames, dir, req) => {
    if (!filenames) return null;
  
    const baseUrl = get_domain(req) || process.env.BASEURL;
  
    let folder;
    switch (dir) {
      case "designs":
        folder = "designs";
        break;
      case "organization":
        folder = "organization";
        break;
      default:
        folder = "others";
    }
  
   
    if (Array.isArray(filenames)) {

       
    return filenames.map(filename => `${baseUrl}/uploads/${folder}/${filename}`);
    }
  else{
    return `${baseUrl}/uploads/${folder}/${filenames}`;
  }
 
  
  };
  

  const get_domain = (req) => {
    const protocol = req.protocol;
    const domain = req.headers.host;
    return `${protocol}://${domain}`;
  };
  