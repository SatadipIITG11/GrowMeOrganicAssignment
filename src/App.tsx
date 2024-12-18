import { useState,useEffect,useRef } from "react";
import "./App.css";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from 'primereact/paginator';
import 'primeicons/primeicons.css';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';



function App() {
  const [movies,setMovies]= useState<{ rowInd: number; title: string }[]>([]);
  const [first, setFirst] = useState(0); // Starting index
  const [page,setPage]= useState(0) // Total records from API
  const [selectedMovies,setSelectedMovies]=useState<{ rowInd: number; title: string }[]>([])
  const [rowSelected, setRowSelected] = useState<number | null | undefined>();
  const [pageInfo,setPageInfo] =useState<number[][]>(Array.from({ length: 20 }, () => []));

  // const op = useRef(null);
  const op = useRef<OverlayPanel | null>(null);
  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Place of Origin" },
    { field: "artist_display", header: "Artist Display" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Start Date" },
    { field: "date_end", header: "End Date" },
  ];
    const fn=async (data:any)=>{
      
        for(let i=1;i<=12;i++)
        {
           data[i-1].rowInd=i;
        }
        return data;
    }
    const fn2=async (movies:any)=>{
      const pageArray=[]
      for(let i=0;i<movies.length;i++)
        {
          const movie=movies[i];
          // console.log(movie.rowInd)
          pageArray.push(movie.rowInd);
        }
        return pageArray
    }
    const fn3=async ()=>{
      const newSelectedMovies = [];
      for (const movie of movies) {
        if (pageInfo[page]?.includes(movie.rowInd)) {
          newSelectedMovies.push(movie);
        }
      }
      return newSelectedMovies;
    }
    const fn4=async (numRows:any)=>{
        const fullPages=Math.floor(numRows/12)
        const partialRows=numRows%12 // on page fullPages +1 
        if(fullPages){
           const twelve=[1,2,3,4,5,6,7,8,9,10,11,12] // Depend on size of api in general
           for(let p=0;p<fullPages;p++)
           {
            setPageInfo(prevPageInfo=>{
              const newPageInfo=[...prevPageInfo]
              newPageInfo[p]=twelve
              return newPageInfo
            })
           }
        }
        if(partialRows){
          const extra:number[]=[];
          for(let i=1;i<=partialRows;i++){
            extra.push(i);
          }
          setPageInfo(prevPageInfo=>{
            const newPageInfo=[...prevPageInfo]
            // newPageInfo[fullPages]=extra
            // console.log(extra)
            const combinedArray =newPageInfo[fullPages].concat(extra);
            newPageInfo[fullPages]=combinedArray
            // return newPageInfo
            return newPageInfo
          })

        }

    }
    // Fetch data on component mount
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`); // API endpoint
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const result = await response.json(); // Parse JSON response
          const data= await fn(result.data)
          setSelectedMovies([])
          // const newSelectedMovies=await fn3()
          setSelectedMovies(await fn3())
          // console.log(pageInfo)
          // setMovies(result.data)
          setMovies(data)

        } catch (error) {
            console.log(error)
        }
      };
  
      fetchData();
    }, [page]);


    const onPageChange=(event:any)=>{
           setFirst(event.first)
           setPage(event.page)
           // i have to make selectedMovies empty
          //  setSelectedMovies([])
           // then reset it

           const newSelectedMovies = [];
           for (const movie of movies) {
             if (pageInfo[event.page]?.includes(movie.rowInd)) {
               newSelectedMovies.push(movie);
             }
           }
           setSelectedMovies(newSelectedMovies);
    }
    const onSelectionChange=async (e:any)=>{
      setSelectedMovies(e.value);
      const pageArray=await fn2(e.value)
      // for(let i=0;i<selectedMovies.length;i++)
      // {
      //   const movie=selectedMovies[i];
      //   // console.log(movie.rowInd)
      //   pageArray.push(movie.rowInd);
      // }
      setPageInfo(prevPageInfo=>{
        const newPageInfo=[...prevPageInfo]
        newPageInfo[page]=pageArray
        return newPageInfo
      })
      // console.log(pageArray)
      // console.log(e.value)
    }
    useEffect(()=>{
      const func= async()=>{
        setSelectedMovies([])
        // const newSelectedMovies=await fn3()
        setSelectedMovies(await fn3())
      }
       func()

    },[pageInfo])

    const onSubmit=async (e:any)=>{
      op.current?.toggle(e)// to close the overlay panel on submit
      setRowSelected(Math.min(rowSelected!,240))
      // First of all change the pageInfo state
      const numRows=Math.min(rowSelected!,240)
      await fn4(numRows)// this will update pageInfo
      // then change selectedMovies
      // by using useEffect
    }
  return (
    <>
      {/* <Button label="Submit" />
      <i className="pi pi-angle-down" style={{ color: 'slateblue' }}></i> */}

      <div className="overlay-box">
            <Button type="button" icon="pi pi-angle-down" label="" onClick={(e) => op.current?.toggle(e)} />
            <OverlayPanel ref={op}>
            <div className="flex-auto">
                <InputNumber inputId="integeronly" value={rowSelected} onValueChange={(e) => setRowSelected(e.value)} placeholder="Enter No. Of Rows.." className="input-box"/>
                <Button type="button" icon="pi" label="Submit" onClick={onSubmit}/>
            </div>
            </OverlayPanel>
      </div>
      <DataTable value={movies} selectionMode='multiple' selection={selectedMovies!} onSelectionChange={onSelectionChange} dataKey="rowInd" tableStyle={{ minWidth: "50rem"}}>
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
      <Paginator first={first} rows={12} totalRecords={12*20} onPageChange={onPageChange} />

    </>
  );
}

export default App;
